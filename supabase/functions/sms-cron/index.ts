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

    // Sync sender IDs
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

    // Sync coverage
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

    // Retry stuck pending rows (older than 5 minutes)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: stuckRows } = await supabaseAdmin
      .from('sms_queue')
      .select('id')
      .eq('status', 'processing')
      .lt('created_at', fiveMinAgo)

    if (stuckRows && stuckRows.length > 0) {
      log(ctx, `Resetting ${stuckRows.length} stuck processing rows to pending`)
      // Reset stuck rows to pending, increment their retry_count
      for (const row of stuckRows) {
        await supabaseAdmin
          .from('sms_queue')
          .update({ status: 'pending' })
          .eq('id', row.id)
          // retry_count is incremented in send-sms when it picks up the row again
      }
      results.retried = stuckRows.length
    } else {
      results.retried = 0
    }

    log(ctx, 'Daily sync complete', results)
    return new Response(JSON.stringify({ result: 'OK', ...results }), { status: 200 })
  } catch (err) {
    logError(ctx, 'Unhandled error', { error: (err as Error).message })
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 })
  }
})
