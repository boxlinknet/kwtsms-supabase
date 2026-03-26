-- Row Level Security policies for all SMS tables
-- Related: all table migrations

-- Enable RLS on all tables
ALTER TABLE public.sms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_admin_recipients ENABLE ROW LEVEL SECURITY;

-- sms_settings: service_role only (managed via Edge Functions)
CREATE POLICY "sms_settings_service_role"
    ON public.sms_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- sms_templates: authenticated can read, service_role can write
CREATE POLICY "sms_templates_read_authenticated"
    ON public.sms_templates
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "sms_templates_service_role"
    ON public.sms_templates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- sms_queue: authenticated can INSERT, service_role has full access
CREATE POLICY "sms_queue_insert_authenticated"
    ON public.sms_queue
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "sms_queue_service_role"
    ON public.sms_queue
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- sms_log: service_role has full access (admin reads via Edge Function)
CREATE POLICY "sms_log_service_role"
    ON public.sms_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- sms_admin_recipients: service_role has full access (managed via Edge Function)
CREATE POLICY "sms_admin_recipients_service_role"
    ON public.sms_admin_recipients
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant execute on RPC functions
GRANT EXECUTE ON FUNCTION public.send_sms TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_sms TO service_role;

-- Grant necessary table permissions for triggers (SECURITY DEFINER functions)
GRANT ALL ON TABLE public.sms_settings TO supabase_auth_admin;
GRANT ALL ON TABLE public.sms_queue TO supabase_auth_admin;
GRANT ALL ON TABLE public.sms_log TO supabase_auth_admin;
GRANT ALL ON TABLE public.sms_templates TO supabase_auth_admin;
GRANT ALL ON TABLE public.sms_admin_recipients TO supabase_auth_admin;
