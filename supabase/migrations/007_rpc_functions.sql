-- RPC convenience function for sending SMS
-- Related: 003_sms_queue.sql

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

COMMENT ON FUNCTION public.send_sms IS 'Convenience function to queue an SMS. Returns the queue row ID.';
