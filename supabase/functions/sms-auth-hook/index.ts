// sms-auth-hook: Supabase Auth Send SMS Hook for OTP delivery via kwtSMS
// Receives { user, sms } from Supabase Auth, verifies webhook signature, sends OTP
// Related: _shared/kwtsms-client.ts, _shared/normalize.ts, _shared/clean.ts, _shared/templates.ts

import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { supabaseAdmin } from '../_shared/db.ts'
import { processAndSend } from '../_shared/send.ts'
import { renderTemplate } from '../_shared/templates.ts'
import { log, debug, error as logError, setDebugLogging } from '../_shared/logger.ts'

interface HookPayload {
  user: {
    id: string
    phone: string
    user_metadata?: {
      language?: string
    }
  }
  sms: {
    otp: string
  }
}

Deno.serve(async (req) => {
  const ctx = 'sms-auth-hook'

  try {
    // Verify Standard Webhooks signature
    const payload = await req.text()
    const hookSecret = Deno.env.get('SEND_SMS_HOOK_SECRET')
    if (!hookSecret) {
      logError(ctx, 'SEND_SMS_HOOK_SECRET not configured')
      return new Response(
        JSON.stringify({ error: { http_code: 500, message: 'Hook secret not configured' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate secret format
    if (!hookSecret.startsWith('v1,whsec_')) {
      logError(ctx, 'Invalid hook secret format, expected v1,whsec_ prefix')
      return new Response(
        JSON.stringify({ error: { http_code: 500, message: 'Invalid hook secret format' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const base64Secret = hookSecret.slice('v1,whsec_'.length)
    const headers = Object.fromEntries(req.headers)
    const wh = new Webhook(base64Secret)

    let data: HookPayload
    try {
      data = wh.verify(payload, headers) as HookPayload
    } catch (err) {
      logError(ctx, 'Webhook signature verification failed', { error: (err as Error).message })
      return new Response(
        JSON.stringify({ error: { http_code: 403, message: 'Invalid webhook signature' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    debug(ctx, 'Webhook verified', { userId: data.user.id })

    // Fetch settings
    const { data: settings, error: settingsErr } = await supabaseAdmin
      .from('sms_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (settingsErr || !settings) {
      logError(ctx, 'Failed to fetch settings')
      return new Response(
        JSON.stringify({ error: { http_code: 500, message: 'Settings not found' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    setDebugLogging(settings.debug_logging)

    // Check gateway enabled
    if (!settings.gateway_enabled) {
      logError(ctx, 'Gateway disabled')
      return new Response(
        JSON.stringify({ error: { http_code: 503, message: 'SMS gateway is disabled' } }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get credentials (from Edge Function secrets for speed, fallback to DB)
    const username = Deno.env.get('KWTSMS_USERNAME') || settings.kwtsms_username
    const password = Deno.env.get('KWTSMS_PASSWORD') || settings.kwtsms_password

    if (!username || !password) {
      logError(ctx, 'kwtSMS credentials not configured')
      return new Response(
        JSON.stringify({ error: { http_code: 500, message: 'SMS credentials not configured' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch OTP template
    const language = data.user.user_metadata?.language || 'en'
    const { data: template } = await supabaseAdmin
      .from('sms_templates')
      .select('*')
      .eq('slug', 'auth_otp')
      .single()

    let message: string
    if (template) {
      const body = language === 'ar' ? template.body_ar : template.body_en
      message = renderTemplate(body, { otp: data.sms.otp })
    } else {
      message = `Your verification code is: ${data.sms.otp}`
    }

    // Send OTP via unified pipeline
    const senderForMessage = settings.sender_id || 'KWT-SMS'
    debug(ctx, 'Sending OTP', { phone: data.user.phone.slice(0, 3) + '****', language })

    const resp = await processAndSend({
      phone: data.user.phone,
      message,
      senderId: senderForMessage,
      username,
      password,
      testMode: settings.test_mode,
      defaultCountryCode: settings.default_country_code,
      coverage: settings.coverage,
    })

    // Log to sms_queue for audit trail (OTP masked in variables)
    const { error: insertErr } = await supabaseAdmin.from('sms_queue').insert({
      phone: data.user.phone,
      phone_normalized: resp.phone,
      template_slug: 'auth_otp',
      variables: { otp: '***' },
      message: resp.message || message,
      language,
      sender_id: senderForMessage,
      recipient_type: 'customer',
      status: resp.ok ? 'sent' : 'failed',
      error_code: resp.errorCode || (resp.result?.code) || null,
      error_message: resp.errorMessage || (resp.result?.description) || null,
      msg_id: resp.result?.['msg-id'] || null,
      points_charged: resp.result?.['points-charged'] || null,
      balance_after: resp.result?.['balance-after'] || null,
      api_response: resp.result || null,
      processed_at: new Date().toISOString(),
    })

    if (insertErr) {
      logError(ctx, 'Failed to log OTP to queue', { error: insertErr.message })
    }

    if (!resp.ok) {
      logError(ctx, 'OTP send failed', { errorCode: resp.errorCode, errorMessage: resp.errorMessage })
      return new Response(
        JSON.stringify({ error: { http_code: 500, message: 'SMS delivery failed' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    log(ctx, 'OTP sent successfully', { msgId: resp.result?.['msg-id'] })
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    logError(ctx, 'Unhandled error', { error: (err as Error).message })
    return new Response(
      JSON.stringify({ error: { http_code: 500, message: 'Failed to send SMS' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
