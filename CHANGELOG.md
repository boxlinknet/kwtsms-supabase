# Changelog

## [1.0.0] - Unreleased

### Added
- Phone OTP authentication using Supabase Auth Send SMS Hook with Standard Webhooks verification
- Event-driven SMS notifications through `sms_queue` table (INSERT to send)
- `send_sms()` RPC convenience function for app-level SMS sending
- Multilingual templates with `{{placeholder}}` replacement (English and Arabic)
- 7 default templates: auth_otp, order_confirmed, order_shipped, order_delivered, order_cancelled, payment_received, welcome
- Template factory reset using stored defaults
- Customer and admin SMS recipients
- Phone normalization: Arabic/Hindi digit conversion, prefix stripping, country code prepend
- Message cleaning: strips emoji, hidden control characters, HTML tags
- kwtSMS API client with `npm:kwtsms` package and fetch fallback
- Cached balance, sender IDs, and coverage with daily sync (pg_cron at 03:00 UTC)
- Queue processor running every 30 seconds (pg_cron + pg_net)
- Batch deduplication (same phone + same message within batch)
- Coverage check before send (skip numbers with no route)
- Zero balance check before processing queue
- SMS audit log with full API response history
- Admin API with 12 endpoints: login, settings, templates, logs, balance sync, gateway test
- Credential masking in API responses and structured JSON logs
- Row Level Security on all 5 tables
- Gateway test mode support (`test=1`)
- Global gateway on/off switch
