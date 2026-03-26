// send-sms: processes pending rows in sms_queue, calls kwtSMS API
// Called by pg_cron every 30s via pg_net, or manually with service_role key
// Related: _shared/kwtsms-client.ts, _shared/normalize.ts, _shared/clean.ts

import { supabaseAdmin } from '../_shared/db.ts'
import { sendSms } from '../_shared/kwtsms-client.ts'
import { validatePhone, normalizePhone } from '../_shared/normalize.ts'
import { cleanMessage } from '../_shared/clean.ts'
import { log, debug, error as logError, setDebugLogging } from '../_shared/logger.ts'

Deno.serve(async (req) => {
  const ctx = 'send-sms'

  try {
    // Fetch settings
    const { data: settings, error: settingsErr } = await supabaseAdmin
      .from('sms_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (settingsErr || !settings) {
      logError(ctx, 'Failed to fetch settings', { error: settingsErr?.message })
      return new Response(JSON.stringify({ error: 'Settings not found' }), { status: 500 })
    }

    setDebugLogging(settings.debug_logging)

    // Check gateway enabled
    if (!settings.gateway_enabled) {
      debug(ctx, 'Gateway disabled, skipping')
      return new Response(JSON.stringify({ skipped: true, reason: 'gateway_disabled' }), { status: 200 })
    }

    // Check credentials
    if (!settings.kwtsms_username || !settings.kwtsms_password) {
      logError(ctx, 'Credentials not configured')
      return new Response(JSON.stringify({ error: 'Credentials not configured' }), { status: 200 })
    }

    // Check cached balance
    if (settings.cached_balance !== null && settings.cached_balance <= 0) {
      logError(ctx, 'Zero balance, skipping send')
      // Mark all pending as failed
      await supabaseAdmin
        .from('sms_queue')
        .update({
          status: 'failed',
          error_code: 'ZERO_BALANCE',
          error_message: 'SMS balance is zero. Recharge at kwtsms.com.',
          processed_at: new Date().toISOString(),
        })
        .eq('status', 'pending')
      return new Response(JSON.stringify({ error: 'Zero balance' }), { status: 200 })
    }

    // Fetch pending queue rows
    const { data: pendingRows, error: queueErr } = await supabaseAdmin
      .from('sms_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(200)

    if (queueErr) {
      logError(ctx, 'Failed to fetch queue', { error: queueErr.message })
      return new Response(JSON.stringify({ error: 'Queue fetch failed' }), { status: 500 })
    }

    if (!pendingRows || pendingRows.length === 0) {
      debug(ctx, 'No pending messages')
      return new Response(JSON.stringify({ processed: 0 }), { status: 200 })
    }

    log(ctx, `Processing ${pendingRows.length} pending messages`)

    // Mark as processing
    const pendingIds = pendingRows.map(r => r.id)
    await supabaseAdmin
      .from('sms_queue')
      .update({ status: 'processing' })
      .in('id', pendingIds)

    // Deduplicate within batch (same phone_normalized + same message)
    const seen = new Set<string>()
    const uniqueRows: typeof pendingRows = []
    const duplicateIds: string[] = []

    for (const row of pendingRows) {
      const key = `${row.phone_normalized}|${row.message}`
      if (seen.has(key)) {
        duplicateIds.push(row.id)
      } else {
        seen.add(key)
        uniqueRows.push(row)
      }
    }

    // Mark duplicates as skipped
    if (duplicateIds.length > 0) {
      log(ctx, `Skipping ${duplicateIds.length} duplicates in batch`)
      await supabaseAdmin
        .from('sms_queue')
        .update({
          status: 'skipped',
          error_code: 'DUPLICATE',
          error_message: 'Duplicate phone+message in the same batch',
          processed_at: new Date().toISOString(),
        })
        .in('id', duplicateIds)
    }

    // Expand admin recipients
    const expandedRows: Array<typeof pendingRows[0] & { target_phone: string }> = []

    for (const row of uniqueRows) {
      if (row.recipient_type === 'admin') {
        const { data: admins } = await supabaseAdmin
          .from('sms_admin_recipients')
          .select('phone_normalized')
          .eq('is_active', true)

        if (!admins || admins.length === 0) {
          await supabaseAdmin.from('sms_queue').update({
            status: 'failed',
            error_code: 'NO_ADMIN_RECIPIENTS',
            error_message: 'No active admin recipients configured',
            processed_at: new Date().toISOString(),
          }).eq('id', row.id)
          continue
        }

        for (const admin of admins) {
          if (admin.phone_normalized) {
            expandedRows.push({ ...row, target_phone: admin.phone_normalized })
          }
        }
      } else {
        expandedRows.push({ ...row, target_phone: row.phone_normalized })
      }
    }

    // Process each row
    let sent = 0
    let failed = 0

    for (const row of expandedRows) {
      const phone = row.target_phone
      if (!phone) {
        await updateQueueRow(row.id, 'failed', 'INVALID_PHONE', 'Phone normalized to empty')
        failed++
        continue
      }

      // Full validation with kwtsms PHONE_RULES
      const validation = validatePhone(phone)
      if (!validation.valid) {
        debug(ctx, 'Phone validation failed', { phone, error: validation.error })
        await updateQueueRow(row.id, 'failed', 'INVALID_PHONE', validation.error || 'Phone validation failed')
        failed++
        continue
      }

      // Check coverage
      if (settings.coverage) {
        const coveragePrefixes = Array.isArray(settings.coverage)
          ? settings.coverage.map((c: unknown) => String(c))
          : []
        if (coveragePrefixes.length > 0) {
          const hasRoute = coveragePrefixes.some((prefix: string) => phone.startsWith(prefix))
          if (!hasRoute) {
            log(ctx, 'No coverage for country', { phone: phone.slice(0, 3) + '***' })
            await updateQueueRow(row.id, 'skipped', 'NO_COVERAGE', `No route for prefix. Country not activated on kwtSMS account.`)
            failed++
            continue
          }
        }
      }

      // Clean message
      const message = cleanMessage(row.message || '')
      if (!message) {
        await updateQueueRow(row.id, 'failed', 'EMPTY_MESSAGE', 'Message empty after cleaning')
        failed++
        continue
      }

      // Determine sender ID
      const senderForMessage = row.sender_id || settings.sender_id || 'KWT-SMS'

      // Send via kwtSMS API
      try {
        const result = await sendSms(
          settings.kwtsms_username,
          settings.kwtsms_password,
          phone,
          message,
          senderForMessage,
          settings.test_mode
        )

        if (result.result === 'OK') {
          await supabaseAdmin.from('sms_queue').update({
            status: 'sent',
            msg_id: result['msg-id'],
            points_charged: result['points-charged'],
            balance_after: result['balance-after'],
            api_response: result,
            processed_at: new Date().toISOString(),
          }).eq('id', row.id)
          sent++
        } else {
          await supabaseAdmin.from('sms_queue').update({
            status: 'failed',
            error_code: result.code,
            error_message: result.description,
            api_response: result,
            processed_at: new Date().toISOString(),
          }).eq('id', row.id)
          failed++
        }
      } catch (err) {
        logError(ctx, 'API call failed', { error: (err as Error).message })
        await updateQueueRow(row.id, 'failed', 'API_ERROR', (err as Error).message)
        failed++
      }
    }

    log(ctx, `Batch complete: ${sent} sent, ${failed} failed, ${duplicateIds.length} duplicates skipped`)
    return new Response(JSON.stringify({ sent, failed, duplicates: duplicateIds.length }), { status: 200 })
  } catch (err) {
    logError(ctx, 'Unhandled error', { error: (err as Error).message })
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 })
  }
})

async function updateQueueRow(id: string, status: string, errorCode: string, errorMessage: string) {
  await supabaseAdmin.from('sms_queue').update({
    status,
    error_code: errorCode,
    error_message: errorMessage,
    processed_at: new Date().toISOString(),
  }).eq('id', id)
}
