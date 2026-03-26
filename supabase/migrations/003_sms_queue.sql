-- sms_queue: central SMS send queue. Apps INSERT here to send SMS.
-- Related: 006_triggers.sql, 007_rpc_functions.sql

CREATE TABLE IF NOT EXISTS public.sms_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone text NOT NULL,
    phone_normalized text,
    template_id uuid REFERENCES public.sms_templates(id),
    template_slug text,
    variables jsonb,
    message text,
    language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar')),
    sender_id text,
    recipient_type text NOT NULL DEFAULT 'customer' CHECK (recipient_type IN ('customer', 'admin')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'skipped')),
    error_code text,
    error_message text,
    msg_id text,
    points_charged integer,
    balance_after integer,
    api_response jsonb,
    retry_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    processed_at timestamptz
);

COMMENT ON TABLE public.sms_queue IS 'Central SMS queue. INSERT a row to send an SMS. System processes pending rows.';
COMMENT ON COLUMN public.sms_queue.phone IS 'Raw phone input in any format. Normalized by trigger.';
COMMENT ON COLUMN public.sms_queue.phone_normalized IS 'Digits-only international format, set automatically by INSERT trigger.';
COMMENT ON COLUMN public.sms_queue.template_slug IS 'Template slug to render. Alternative to providing message directly.';
COMMENT ON COLUMN public.sms_queue.variables IS 'JSON object of placeholder values for template rendering.';
COMMENT ON COLUMN public.sms_queue.message IS 'Final message text. Set by trigger from template, or provided directly.';
COMMENT ON COLUMN public.sms_queue.recipient_type IS 'customer = send to phone column. admin = send to all active admin recipients.';

CREATE INDEX idx_sms_queue_status ON public.sms_queue (status) WHERE status = 'pending';
CREATE INDEX idx_sms_queue_created ON public.sms_queue (created_at);
