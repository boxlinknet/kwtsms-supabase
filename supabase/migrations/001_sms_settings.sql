-- sms_settings: single-row project-wide kwtSMS configuration
-- Related: 006_triggers.sql, 010_seed_defaults.sql

CREATE TABLE IF NOT EXISTS public.sms_settings (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    kwtsms_username text,
    kwtsms_password text,
    sender_id text NOT NULL DEFAULT 'KWT-SMS',
    default_country_code text NOT NULL DEFAULT '965',
    test_mode boolean NOT NULL DEFAULT true,
    gateway_enabled boolean NOT NULL DEFAULT false,
    debug_logging boolean NOT NULL DEFAULT true,
    cached_balance integer,
    cached_purchased integer,
    sender_ids jsonb,
    coverage jsonb,
    balance_synced_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.sms_settings IS 'Single-row kwtSMS gateway configuration. Enforced by CHECK (id = 1).';
COMMENT ON COLUMN public.sms_settings.kwtsms_username IS 'kwtSMS API username (not the account mobile number)';
COMMENT ON COLUMN public.sms_settings.kwtsms_password IS 'kwtSMS API password';
COMMENT ON COLUMN public.sms_settings.sender_id IS 'Active sender ID, selected from /senderid/ API response';
COMMENT ON COLUMN public.sms_settings.default_country_code IS 'Default country code for local numbers, selected from /coverage/ API response';
COMMENT ON COLUMN public.sms_settings.test_mode IS 'When true, kwtSMS queues messages but does not deliver (test=1)';
COMMENT ON COLUMN public.sms_settings.gateway_enabled IS 'Global on/off switch for all SMS sending';
COMMENT ON COLUMN public.sms_settings.debug_logging IS 'When true, log verbose debug info. When false, log only major actions.';
COMMENT ON COLUMN public.sms_settings.cached_balance IS 'Cached SMS credit balance, updated from send responses and daily sync';
COMMENT ON COLUMN public.sms_settings.sender_ids IS 'Cached sender ID list from /senderid/ API';
COMMENT ON COLUMN public.sms_settings.coverage IS 'Cached country coverage list from /coverage/ API';
