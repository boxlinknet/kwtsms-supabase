// send-sms: processes pending rows in sms_queue, calls kwtSMS API
// Called by pg_cron every 30s via pg_net, or manually with service_role key
// Related: _shared/kwtsms-client.ts, _shared/normalize.ts, _shared/clean.ts

import { supabaseAdmin } from '../_shared/db.ts'
import { processAndSend } from '../_shared/send.ts'
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

    // Atomically claim pending rows (prevents race condition with concurrent invocations)
    const { data: pendingRows, error: claimErr } = await supabaseAdmin
      .rpc('claim_pending_sms', { batch_size: 200 })

    if (claimErr) {
      logError(ctx, 'Failed to claim queue rows', { error: claimErr.message })
      return new Response(JSON.stringify({ error: 'Queue claim failed' }), { status: 500 })
    }

    if (!pendingRows || pendingRows.length === 0) {
      debug(ctx, 'No pending messages')
      return new Response(JSON.stringify({ processed: 0 }), { status: 200 })
    }

    log(ctx, `Processing ${pendingRows.length} claimed messages`)

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
    // For admin-type rows, create separate queue rows per admin phone
    // so each gets its own status, msg_id, and audit trail
    const expandedRows: Array<typeof pendingRows[0] & { target_phone: string }> = []

    // Cache admin recipients (avoid repeated queries)
    let cachedAdmins: Array<{ phone_normalized: string | null }> | null = null

    for (const row of uniqueRows) {
      if (row.recipient_type === 'admin') {
        if (cachedAdmins === null) {
          const { data: admins } = await supabaseAdmin
            .from('sms_admin_recipients')
            .select('phone_normalized')
            .eq('is_active', true)
          cachedAdmins = admins || []
        }

        if (cachedAdmins.length === 0) {
          await supabaseAdmin.from('sms_queue').update({
            status: 'failed',
            error_code: 'NO_ADMIN_RECIPIENTS',
            error_message: 'No active admin recipients configured',
            processed_at: new Date().toISOString(),
          }).eq('id', row.id)
          continue
        }

        // First admin uses the original row
        const validAdmins = cachedAdmins.filter(a => a.phone_normalized)
        if (validAdmins.length > 0) {
          expandedRows.push({ ...row, target_phone: validAdmins[0].phone_normalized! })
        }

        // Additional admins get new queue rows
        for (let i = 1; i < validAdmins.length; i++) {
          const { data: newRow, error: insertErr } = await supabaseAdmin.from('sms_queue').insert({
            phone: validAdmins[i].phone_normalized!,
            phone_normalized: validAdmins[i].phone_normalized!,
            message: row.message,
            template_slug: row.template_slug,
            variables: row.variables,
            language: row.language,
            sender_id: row.sender_id,
            recipient_type: 'admin',
            status: 'processing',
          }).select('*').single()
          if (insertErr) {
            logError(ctx, 'Failed to create admin expansion row', { error: insertErr.message })
          } else if (newRow) {
            expandedRows.push({ ...newRow, target_phone: validAdmins[i].phone_normalized! })
          }
        }
      } else {
        expandedRows.push({ ...row, target_phone: row.phone_normalized })
      }
    }

    // Process each row via unified send pipeline
    let sent = 0
    let failed = 0

    for (const row of expandedRows) {
      const senderForMessage = row.sender_id || settings.sender_id || 'KWT-SMS'

      const resp = await processAndSend({
        phone: row.target_phone || '',
        message: row.message || '',
        senderId: senderForMessage,
        username: settings.kwtsms_username,
        password: settings.kwtsms_password,
        testMode: settings.test_mode,
        defaultCountryCode: settings.default_country_code,
        coverage: settings.coverage,
        skipNormalize: true,
      })

      if (resp.ok && resp.result) {
        await supabaseAdmin.from('sms_queue').update({
          status: 'sent',
          msg_id: resp.result['msg-id'],
          points_charged: resp.result['points-charged'],
          balance_after: resp.result['balance-after'],
          api_response: resp.result,
          processed_at: new Date().toISOString(),
        }).eq('id', row.id)
        sent++

        // Stop sending if balance hits zero
        if (resp.result['balance-after'] !== undefined && resp.result['balance-after'] <= 0) {
          log(ctx, 'Balance depleted mid-batch, stopping')
          break
        }
      } else {
        const status = resp.errorCode === 'NO_COVERAGE' ? 'skipped' : 'failed'
        await supabaseAdmin.from('sms_queue').update({
          status,
          error_code: resp.errorCode || resp.result?.code,
          error_message: resp.errorMessage || resp.result?.description,
          api_response: resp.result || null,
          processed_at: new Date().toISOString(),
        }).eq('id', row.id)
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

