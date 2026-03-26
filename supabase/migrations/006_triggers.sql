-- Triggers for sms_queue and sms_admin_recipients
-- Related: 003_sms_queue.sql, 004_sms_log.sql, 005_sms_admin_recipients.sql

-- Helper: basic phone normalization in PL/pgSQL
-- Full validation with PHONE_RULES happens in the send-sms Edge Function
CREATE OR REPLACE FUNCTION public.normalize_phone_basic(raw_phone text, country_code text DEFAULT '965')
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    cleaned text;
BEGIN
    IF raw_phone IS NULL OR raw_phone = '' THEN
        RETURN NULL;
    END IF;

    cleaned := raw_phone;

    -- Convert Arabic-Indic digits (U+0660-U+0669) to Latin
    cleaned := translate(cleaned, '٠١٢٣٤٥٦٧٨٩', '0123456789');
    -- Convert Extended Arabic-Indic digits (U+06F0-U+06F9) to Latin
    cleaned := translate(cleaned, '۰۱۲۳۴۵۶۷۸۹', '0123456789');

    -- Strip all non-digit characters
    cleaned := regexp_replace(cleaned, '[^0-9]', '', 'g');

    -- Strip leading '00' (international prefix)
    IF cleaned LIKE '00%' THEN
        cleaned := substring(cleaned FROM 3);
    END IF;

    -- Strip leading '0' (local format)
    IF cleaned LIKE '0%' AND length(cleaned) > 1 THEN
        cleaned := substring(cleaned FROM 2);
    END IF;

    -- If number is short (likely local), prepend default country code
    -- International numbers are typically 10-15 digits including country code
    -- Local numbers are typically 7-9 digits
    IF length(cleaned) <= 9 AND length(cleaned) >= 7 THEN
        cleaned := country_code || cleaned;
    END IF;

    -- Basic length validation
    IF length(cleaned) < 8 OR length(cleaned) > 15 THEN
        RETURN NULL;
    END IF;

    RETURN cleaned;
END;
$$;

-- Helper: render template with {{placeholder}} replacement
CREATE OR REPLACE FUNCTION public.render_template(template_body text, vars jsonb)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    result text;
    key text;
    value text;
BEGIN
    result := template_body;
    IF vars IS NULL THEN
        RETURN result;
    END IF;

    FOR key, value IN SELECT * FROM jsonb_each_text(vars)
    LOOP
        result := replace(result, '{{' || key || '}}', value);
    END LOOP;

    RETURN result;
END;
$$;

-- Trigger function: normalize phone and render template on sms_queue INSERT
CREATE OR REPLACE FUNCTION public.sms_queue_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    settings_row public.sms_settings%ROWTYPE;
    template_row public.sms_templates%ROWTYPE;
    normalized text;
    template_body text;
BEGIN
    -- Fetch settings for country code
    SELECT * INTO settings_row FROM public.sms_settings WHERE id = 1;

    -- Normalize phone
    normalized := public.normalize_phone_basic(NEW.phone, COALESCE(settings_row.default_country_code, '965'));

    IF normalized IS NULL THEN
        NEW.phone_normalized := NULL;
        NEW.status := 'failed';
        NEW.error_code := 'INVALID_PHONE';
        NEW.error_message := 'Phone number is invalid or too short/long: ' || COALESCE(NEW.phone, '(empty)');
        RETURN NEW;
    END IF;

    NEW.phone_normalized := normalized;

    -- Render template if template_slug is set and message is not provided
    IF NEW.message IS NULL AND NEW.template_slug IS NOT NULL THEN
        SELECT * INTO template_row FROM public.sms_templates WHERE slug = NEW.template_slug;

        IF template_row.id IS NULL THEN
            NEW.status := 'failed';
            NEW.error_code := 'TEMPLATE_NOT_FOUND';
            NEW.error_message := 'Template not found: ' || NEW.template_slug;
            RETURN NEW;
        END IF;

        IF NEW.language = 'ar' THEN
            template_body := template_row.body_ar;
        ELSE
            template_body := template_row.body_en;
        END IF;

        NEW.message := public.render_template(template_body, NEW.variables);
    END IF;

    -- Render template if template_id is set and message is not provided
    IF NEW.message IS NULL AND NEW.template_id IS NOT NULL THEN
        SELECT * INTO template_row FROM public.sms_templates WHERE id = NEW.template_id;

        IF template_row.id IS NULL THEN
            NEW.status := 'failed';
            NEW.error_code := 'TEMPLATE_NOT_FOUND';
            NEW.error_message := 'Template not found by ID';
            RETURN NEW;
        END IF;

        IF NEW.language = 'ar' THEN
            template_body := template_row.body_ar;
        ELSE
            template_body := template_row.body_en;
        END IF;

        NEW.message := public.render_template(template_body, NEW.variables);
    END IF;

    -- Final validation: message must not be empty
    IF NEW.message IS NULL OR trim(NEW.message) = '' THEN
        NEW.status := 'failed';
        NEW.error_code := 'EMPTY_MESSAGE';
        NEW.error_message := 'Message is empty. Provide a message or a valid template_slug with variables.';
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sms_queue_before_insert
    BEFORE INSERT ON public.sms_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.sms_queue_before_insert();

-- Trigger function: copy processed rows to sms_log and update cached balance
CREATE OR REPLACE FUNCTION public.sms_queue_after_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only act when status changes to a terminal state
    IF NEW.status IN ('sent', 'failed', 'skipped') AND OLD.status != NEW.status THEN
        -- Copy to sms_log
        INSERT INTO public.sms_log (
            queue_id, phone, phone_normalized, message, template_slug,
            variables, sender_id, recipient_type, status, error_code,
            error_message, msg_id, points_charged, balance_after,
            api_response, created_at, processed_at
        ) VALUES (
            NEW.id, NEW.phone, NEW.phone_normalized, NEW.message, NEW.template_slug,
            NEW.variables, NEW.sender_id, NEW.recipient_type, NEW.status, NEW.error_code,
            NEW.error_message, NEW.msg_id, NEW.points_charged, NEW.balance_after,
            NEW.api_response, NEW.created_at, NEW.processed_at
        );

        -- Update cached balance if sent successfully
        IF NEW.status = 'sent' AND NEW.balance_after IS NOT NULL THEN
            UPDATE public.sms_settings
            SET cached_balance = NEW.balance_after,
                updated_at = now()
            WHERE id = 1;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sms_queue_after_update
    AFTER UPDATE ON public.sms_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.sms_queue_after_update();

-- Trigger: normalize phone on sms_admin_recipients INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.sms_admin_recipients_normalize()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    settings_row public.sms_settings%ROWTYPE;
BEGIN
    SELECT * INTO settings_row FROM public.sms_settings WHERE id = 1;
    NEW.phone_normalized := public.normalize_phone_basic(NEW.phone, COALESCE(settings_row.default_country_code, '965'));
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sms_admin_recipients_normalize
    BEFORE INSERT OR UPDATE ON public.sms_admin_recipients
    FOR EACH ROW
    EXECUTE FUNCTION public.sms_admin_recipients_normalize();

-- Trigger: auto-update updated_at on sms_settings
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sms_settings_updated_at
    BEFORE UPDATE ON public.sms_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_sms_templates_updated_at
    BEFORE UPDATE ON public.sms_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
