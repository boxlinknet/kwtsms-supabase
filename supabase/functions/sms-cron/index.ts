// sms-cron: daily sync for balance, sender IDs, coverage. Retries stuck queue rows.
// Called by pg_cron daily at 06:00 Kuwait time (03:00 UTC)
// Related: _shared/kwtsms-client.ts, _shared/db.ts

import { supabaseAdmin } from '../_shared/db.ts'
import { getBalance, getSenderIds, getCoverage } from '../_shared/kwtsms-client.ts'
import { log, debug, error as logError, setDebugLogging } from '../_shared/logger.ts'

Deno.serve(async (req) => {
  const ctx = 'sms-cron'

  try {
    // Fetch settings
    const { data: settings, error: settingsErr } = await supabaseAdmin
      .from('sms_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (settingsErr || !settings) {
      logError(ctx, 'Failed to fetch settings')
      return new Response(JSON.stringify({ error: 'Settings not found' }), { status: 500 })
    }

    setDebugLogging(settings.debug_logging)

    if (!settings.kwtsms_username || !settings.kwtsms_password) {
      debug(ctx, 'Credentials not configured, skipping sync')
      return new Response(JSON.stringify({ skipped: true, reason: 'no_credentials' }), { status: 200 })
    }

    const results: Record<string, unknown> = {}

    // Sync balance
    try {
      log(ctx, 'Syncing balance')
      const balanceResult = await getBalance(settings.kwtsms_username, settings.kwtsms_password)
      if (balanceResult.result === 'OK') {
        await supabaseAdmin.from('sms_settings').update({
          cached_balance: balanceResult.available,
          cached_purchased: balanceResult.purchased,
          balance_synced_at: new Date().toISOString(),
        }).eq('id', 1)
        results.balance = { available: balanceResult.available, purchased: balanceResult.purchased }
      } else {
        results.balance = { error: balanceResult.code }
      }
    } catch (err) {
      logError(ctx, 'Balance sync failed', { error: (err as Error).message })
      results.balance = { error: (err as Error).message }
    }

    // Sync sender IDs
    try {
      log(ctx, 'Syncing sender IDs')
      const senderResult = await getSenderIds(settings.kwtsms_username, settings.kwtsms_password)
      if (senderResult.result === 'OK') {
        await supabaseAdmin.from('sms_settings').update({
          sender_ids: senderResult.senderid,
        }).eq('id', 1)
        results.senderIds = senderResult.senderid
      } else {
        results.senderIds = { error: senderResult.code }
      }
    } catch (err) {
      logError(ctx, 'Sender ID sync failed', { error: (err as Error).message })
      results.senderIds = { error: (err as Error).message }
    }

    // Sync coverage
    try {
      log(ctx, 'Syncing coverage')
      const coverageResult = await getCoverage(settings.kwtsms_username, settings.kwtsms_password)
      if (coverageResult.result === 'OK') {
        await supabaseAdmin.from('sms_settings').update({
          coverage: coverageResult.coverage,
        }).eq('id', 1)
        results.coverage = 'synced'
      } else {
        results.coverage = { error: coverageResult.code }
      }
    } catch (err) {
      logError(ctx, 'Coverage sync failed', { error: (err as Error).message })
      results.coverage = { error: (err as Error).message }
    }

    // Retry stuck processing rows (older than 5 minutes)
    const MAX_RETRIES = 3
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: stuckRows } = await supabaseAdmin
      .from('sms_queue')
      .select('id, retry_count')
      .eq('status', 'processing')
      .lt('created_at', fiveMinAgo)

    let retried = 0
    let abandoned = 0

    if (stuckRows && stuckRows.length > 0) {
      for (const row of stuckRows) {
        const newRetryCount = (row.retry_count || 0) + 1
        if (newRetryCount > MAX_RETRIES) {
          await supabaseAdmin.from('sms_queue').update({
            status: 'failed',
            error_code: 'MAX_RETRIES',
            error_message: `Exceeded ${MAX_RETRIES} retry attempts`,
            retry_count: newRetryCount,
            processed_at: new Date().toISOString(),
          }).eq('id', row.id)
          abandoned++
        } else {
          await supabaseAdmin.from('sms_queue').update({
            status: 'pending',
            retry_count: newRetryCount,
          }).eq('id', row.id)
          retried++
        }
      }
      log(ctx, `Stuck rows: ${retried} retried, ${abandoned} abandoned (max retries)`)
    }
    results.retried = retried
    results.abandoned = abandoned

    log(ctx, 'Daily sync complete', results)
    return new Response(JSON.stringify({ result: 'OK', ...results }), { status: 200 })
  } catch (err) {
    logError(ctx, 'Unhandled error', { error: (err as Error).message })
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 })
  }
})
