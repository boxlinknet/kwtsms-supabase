-- Security and integrity fixes from code review
-- Addresses: RLS tightening, missing constraints, indexes, race condition prevention,
-- parameter validation, and duplicate log prevention

-- ============================================================
-- 1. RLS: Restrict authenticated INSERT to customer type only
--    (admin messages must go through Edge Functions with service_role)
-- ============================================================
DROP POLICY IF EXISTS "sms_queue_insert_authenticated" ON public.sms_queue;
CREATE POLICY "sms_queue_insert_authenticated"
    ON public.sms_queue
    FOR INSERT
    TO authenticated
    WITH CHECK (recipient_type = 'customer');

-- ============================================================
-- 2. Unique constraint on sms_log.queue_id (prevent duplicate log entries)
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_sms_log_queue_id
    ON public.sms_log (queue_id);

-- ============================================================
-- 3. Unique constraint on admin recipients (prevent duplicate phones)
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_sms_admin_recipients_phone
    ON public.sms_admin_recipients (phone_normalized)
    WHERE phone_normalized IS NOT NULL;

-- ============================================================
-- 4. Missing indexes for common query patterns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sms_queue_phone_normalized
    ON public.sms_queue (phone_normalized);

CREATE INDEX IF NOT EXISTS idx_sms_queue_processing
    ON public.sms_queue (status, created_at)
    WHERE status = 'processing';

CREATE INDEX IF NOT EXISTS idx_sms_admin_recipients_active
    ON public.sms_admin_recipients (is_active)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_sms_log_status_created
    ON public.sms_log (status, created_at DESC);

-- ============================================================
-- 5. Atomic claim of pending queue rows (prevents race condition
--    when multiple send-sms invocations run concurrently)
-- ============================================================
CREATE OR REPLACE FUNCTION public.claim_pending_sms(batch_size integer DEFAULT 200)
RETURNS SETOF public.sms_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.sms_queue
    SET status = 'processing'
    WHERE id IN (
        SELECT id FROM public.sms_queue
        WHERE status = 'pending'
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT batch_size
    )
    RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_pending_sms TO service_role;

-- ============================================================
-- 6. Updated send_sms RPC with parameter validation
-- ============================================================
CREATE OR REPLACE FUNCTION public.send_sms(
    p_phone text,
    p_template_slug text DEFAULT NULL,
    p_variables jsonb DEFAULT NULL,
    p_language text DEFAULT 'en',
    p_recipient_type text DEFAULT 'customer',
    p_sender_id text DEFAULT NULL,
    p_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_id uuid;
BEGIN
    -- Validate language
    IF p_language NOT IN ('en', 'ar') THEN
        RAISE EXCEPTION 'Invalid language: %. Must be en or ar.', p_language;
    END IF;

    -- Validate recipient_type
    IF p_recipient_type NOT IN ('customer', 'admin') THEN
        RAISE EXCEPTION 'Invalid recipient_type: %. Must be customer or admin.', p_recipient_type;
    END IF;

    -- Validate phone is provided
    IF p_phone IS NULL OR trim(p_phone) = '' THEN
        RAISE EXCEPTION 'Phone number is required';
    END IF;

    -- Validate that either message or template is provided
    IF p_message IS NULL AND p_template_slug IS NULL THEN
        RAISE EXCEPTION 'Either message or template_slug is required';
    END IF;

    INSERT INTO public.sms_queue (
        phone, template_slug, variables, language,
        recipient_type, sender_id, message
    ) VALUES (
        p_phone, p_template_slug, p_variables, p_language,
        p_recipient_type, p_sender_id, p_message
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$;
