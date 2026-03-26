# kwtSMS for Supabase

SMS integration for Supabase using the kwtSMS gateway (kwtsms.com). Enables phone OTP authentication and event-driven SMS notifications.

## Features

- Phone OTP login via Supabase Auth Send SMS Hook
- Event-driven SMS notifications via queue table
- Multilingual templates (English/Arabic) with placeholder replacement
- Customer and admin SMS recipients
- Automatic phone normalization (80+ countries)
- Message cleaning (strips emoji, hidden characters)
- Balance, sender ID, and coverage sync
- SMS audit log

## Quick Start

### Prerequisites

- Supabase project (local or hosted)
- Supabase CLI installed
- kwtSMS account with API access (kwtsms.com)

### Install

1. Clone this repo into your Supabase project:

   ```bash
   git clone <repo-url>
   cd kwtsms_supabase
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
   - Go to Authentication > Hooks > Send SMS
   - Select HTTP and enter the `sms-auth-hook` function URL

### Send an SMS

```sql
INSERT INTO sms_queue (phone, template_slug, variables, language)
VALUES ('96598765432', 'order_confirmed', '{"order_id": "1234"}', 'en');
```

Or via RPC:

```typescript
const { data } = await supabase.rpc('send_sms', {
  phone: '96598765432',
  template_slug: 'order_confirmed',
  variables: { order_id: '1234' },
  language: 'en'
})
```

## License

MIT
