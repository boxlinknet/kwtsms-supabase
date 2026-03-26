-- sms_templates: multilingual SMS message templates with factory reset
-- Related: 006_triggers.sql, 010_seed_defaults.sql

CREATE TABLE IF NOT EXISTS public.sms_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    description text NOT NULL DEFAULT '',
    body_en text NOT NULL DEFAULT '',
    body_ar text NOT NULL DEFAULT '',
    default_body_en text NOT NULL DEFAULT '',
    default_body_ar text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.sms_templates IS 'SMS message templates with {{placeholder}} support and factory reset capability.';
COMMENT ON COLUMN public.sms_templates.slug IS 'Unique identifier (e.g. auth_otp, order_confirmed)';
COMMENT ON COLUMN public.sms_templates.body_en IS 'User-editable English template with {{placeholders}}';
COMMENT ON COLUMN public.sms_templates.body_ar IS 'User-editable Arabic template with {{placeholders}}';
COMMENT ON COLUMN public.sms_templates.default_body_en IS 'Factory default English template (read-only, used for reset)';
COMMENT ON COLUMN public.sms_templates.default_body_ar IS 'Factory default Arabic template (read-only, used for reset)';

CREATE INDEX idx_sms_templates_slug ON public.sms_templates (slug);
