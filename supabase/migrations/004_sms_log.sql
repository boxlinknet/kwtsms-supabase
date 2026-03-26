-- sms_log: permanent SMS audit trail. Rows copied from sms_queue after processing.
-- Related: 006_triggers.sql

CREATE TABLE IF NOT EXISTS public.sms_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id uuid NOT NULL,
    phone text NOT NULL,
    phone_normalized text,
    message text,
    template_slug text,
    variables jsonb,
    sender_id text,
    recipient_type text,
    status text NOT NULL,
    error_code text,
    error_message text,
    msg_id text,
    points_charged integer,
    balance_after integer,
    api_response jsonb,
    created_at timestamptz NOT NULL,
    processed_at timestamptz
);

COMMENT ON TABLE public.sms_log IS 'Permanent audit trail. Every processed SMS (sent, failed, skipped) is logged here.';

CREATE INDEX idx_sms_log_created ON public.sms_log (created_at DESC);
CREATE INDEX idx_sms_log_status ON public.sms_log (status);
CREATE INDEX idx_sms_log_phone ON public.sms_log (phone_normalized);
