-- pg_cron scheduled jobs for queue processing and daily sync
-- Related: send-sms Edge Function, sms-cron Edge Function

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Process pending SMS queue every 30 seconds
-- Calls the send-sms Edge Function via pg_net
SELECT cron.schedule(
    'sms_process_queue',
    '30 seconds',
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-sms',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object('action', 'process_queue')
    ) AS request_id;
    $$
);

-- Daily sync: balance, sender IDs, coverage (06:00 Kuwait time = 03:00 UTC)
SELECT cron.schedule(
    'sms_daily_sync',
    '0 3 * * *',
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/sms-cron',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object('action', 'daily_sync')
    ) AS request_id;
    $$
);
