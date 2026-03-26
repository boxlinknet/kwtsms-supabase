-- sms_admin_recipients: admin phone numbers for admin-type SMS notifications
-- Related: 006_triggers.sql

CREATE TABLE IF NOT EXISTS public.sms_admin_recipients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone text NOT NULL,
    phone_normalized text,
    label text NOT NULL DEFAULT '',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.sms_admin_recipients IS 'Admin phone numbers. When sms_queue.recipient_type = admin, SMS is sent to all active recipients.';
