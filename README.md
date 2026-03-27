<p align="center">
  <img src="https://www.kwtsms.com/images/kwtsms_logo_60.png" alt="kwtSMS" height="60">
</p>

<h1 align="center">kwtSMS for Supabase</h1>

<p align="center">
  SMS gateway integration for Supabase using <a href="https://www.kwtsms.com">kwtSMS</a>
</p>

<p align="center">
  <a href="https://github.com/boxlinknet/kwtsms-supabase/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Edge_Functions-3FCF8E?logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://deno.land"><img src="https://img.shields.io/badge/Deno-TypeScript-000000?logo=deno&logoColor=white" alt="Deno"></a>
  <a href="https://www.kwtsms.com"><img src="https://img.shields.io/badge/kwtSMS-Gateway-FFA200" alt="kwtSMS"></a>
  <img src="https://img.shields.io/badge/i18n-EN%20%7C%20AR-blueviolet" alt="Languages">
</p>

---

## About kwtSMS

[kwtSMS](https://www.kwtsms.com) is a Kuwait-based SMS gateway providing A2P (application-to-person) messaging across 200+ countries. It supports transactional and promotional sender IDs, Arabic and English messages, and a REST/JSON API for programmatic SMS delivery.

This integration connects kwtSMS to your Supabase project, replacing the default SMS provider for phone authentication and adding event-driven SMS notifications through a simple queue-based architecture.

## Features

- **Phone OTP login** using the Supabase Auth Send SMS Hook
- **Event-driven notifications** through an `sms_queue` table (INSERT to send)
- **Multilingual templates** with `{{placeholder}}` support (English and Arabic)
- **Customer and admin recipients** from a single queue
- **Phone normalization** with Arabic digit conversion, prefix stripping, and country code prepend
- **Message cleaning** strips emoji, hidden characters, and HTML tags before send
- **Balance, sender ID, and coverage sync** cached locally, updated daily
- **SMS audit log** with full API response history
- **Gateway test mode** for development without consuming credits

## Architecture

```
Supabase Auth ──> sms-auth-hook ──> kwtSMS API
                                        ^
App / DB ──> sms_queue table            |
                 |                      |
           pg_cron (30s) ──> send-sms ──┘

sms-admin ──> settings, templates, logs
sms-cron  ──> daily balance/coverage sync
```

Four Edge Functions, five database tables, PL/pgSQL triggers for normalization and template rendering, and pg_cron for queue processing.

## Quick start

### Prerequisites

- Supabase project (local or hosted)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [kwtSMS account](https://www.kwtsms.com) with API access

### Install

1. Clone this repo:

   ```bash
   git clone https://github.com/boxlinknet/kwtsms-supabase.git
   cd kwtsms-supabase
   ```

2. Link to your Supabase project:

   ```bash
   supabase link --project-ref <YOUR_PROJECT_ID>
   ```

3. Run database migrations:

   ```bash
   supabase db push
   ```

4. Set your kwtSMS credentials:

   ```bash
   supabase secrets set KWTSMS_USERNAME=your_api_username
   supabase secrets set KWTSMS_PASSWORD=your_api_password
   supabase secrets set SEND_SMS_HOOK_SECRET=v1,whsec_your_secret_here
   ```

5. Deploy Edge Functions:

   ```bash
   supabase functions deploy
   ```

6. Enable the Send SMS Hook in the Supabase Dashboard:
   - Go to **Authentication > Hooks > Send SMS**
   - Select HTTP and enter the `sms-auth-hook` function URL

### Send an SMS

Queue an SMS with a template:

```sql
INSERT INTO sms_queue (phone, template_slug, variables, language)
VALUES ('96598765432', 'order_confirmed', '{"order_id": "1234"}', 'en');
```

Or call the RPC function from your app:

```typescript
const { data } = await supabase.rpc('send_sms', {
  p_phone: '96598765432',
  p_template_slug: 'order_confirmed',
  p_variables: { order_id: '1234' },
  p_language: 'en'
})
```

The queue processor picks up pending rows every 30 seconds, normalizes the phone number, cleans the message, and sends it through the kwtSMS API.

## Default templates

| Slug | English | Arabic |
|------|---------|--------|
| `auth_otp` | Your verification code is: `{{otp}}` | رمز التحقق الخاص بك هو: `{{otp}}` |
| `order_confirmed` | Your order #`{{order_id}}` has been confirmed. | تم تأكيد طلبك رقم #`{{order_id}}`. |
| `order_shipped` | Your order #`{{order_id}}` has been shipped. | تم شحن طلبك رقم #`{{order_id}}`. |
| `order_delivered` | Your order #`{{order_id}}` has been delivered. | تم توصيل طلبك رقم #`{{order_id}}`. |
| `order_cancelled` | Your order #`{{order_id}}` has been cancelled. | تم إلغاء طلبك رقم #`{{order_id}}`. |
| `payment_received` | Payment of `{{amount}}` received. Thank you. | تم استلام دفعة بقيمة `{{amount}}`. شكرا لك. |
| `welcome` | Welcome to `{{app_name}}`! | مرحبا بك في `{{app_name}}`! |

Templates are editable through the `sms-admin` Edge Function and can be reset to defaults at any time.

## Admin API

The `sms-admin` Edge Function exposes these endpoints (requires `service_role` JWT):

| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Test credentials, save to settings |
| GET | `/settings` | Get settings (credentials masked) |
| PUT | `/settings` | Update gateway settings |
| GET | `/templates` | List all templates |
| PUT | `/templates/:slug` | Update a template |
| POST | `/templates/:slug/reset` | Reset a template to default |
| POST | `/templates/reset` | Reset all templates |
| GET | `/logs` | Paginated SMS log |
| DELETE | `/logs` | Clear logs |
| GET | `/balance` | Get cached balance |
| POST | `/balance/sync` | Sync balance from kwtSMS |
| POST | `/test-gateway` | Send a test SMS |

## License

MIT
