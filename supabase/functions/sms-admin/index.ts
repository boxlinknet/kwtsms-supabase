// sms-admin: CRUD endpoints for settings, templates, logs, gateway management
// All endpoints require a valid JWT with service_role privileges
// Related: _shared/kwtsms-client.ts, _shared/db.ts, _shared/cors.ts

import { supabaseAdmin } from '../_shared/db.ts'
import { corsHeaders, corsResponse } from '../_shared/cors.ts'
import { getBalance, getSenderIds, getCoverage } from '../_shared/kwtsms-client.ts'
import { processAndSend } from '../_shared/send.ts'
import { log, error as logError, setDebugLogging } from '../_shared/logger.ts'

function unauthorizedResponse(headers: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized: service_role required' }), { status: 401, headers })
}

const SLUG_PATTERN = /^[a-z0-9_]+$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse()

  const ctx = 'sms-admin'
  const url = new URL(req.url)
  const path = url.pathname.replace('/sms-admin', '').replace(/^\/+/, '')
  const method = req.method

  const headers = { ...corsHeaders, 'Content-Type': 'application/json' }

  try {
    // Verify service_role authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(headers)
    }
    const token = authHeader.replace('Bearer ', '')
    // Decode JWT payload to check role (Supabase JWTs are standard base64url)
    try {
      const payloadB64 = token.split('.')[1]
      const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
      if (payload.role !== 'service_role') {
        return unauthorizedResponse(headers)
      }
    } catch {
      return unauthorizedResponse(headers)
    }

    // POST /login
    if (method === 'POST' && path === 'login') {
      const { username, password } = await req.json()
      if (!username || !password) {
        return new Response(JSON.stringify({ error: 'Username and password required' }), { status: 400, headers })
      }

      // Test credentials with /balance/
      const balanceResult = await getBalance(username, password)
      if (balanceResult.result !== 'OK') {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers })
      }

      // Fetch sender IDs and coverage
      const senderResult = await getSenderIds(username, password)
      const coverageResult = await getCoverage(username, password)

      // Save to settings
      await supabaseAdmin.from('sms_settings').update({
        kwtsms_username: username,
        kwtsms_password: password,
        cached_balance: balanceResult.available,
        cached_purchased: balanceResult.purchased,
        sender_ids: senderResult.result === 'OK' ? senderResult.senderid : null,
        coverage: coverageResult.result === 'OK' ? coverageResult.prefixes : null,
        balance_synced_at: new Date().toISOString(),
      }).eq('id', 1)

      log(ctx, 'Gateway login successful', { balance: balanceResult.available })

      return new Response(JSON.stringify({
        result: 'OK',
        balance: balanceResult.available,
        purchased: balanceResult.purchased,
        sender_ids: senderResult.result === 'OK' ? senderResult.senderid : [],
        coverage: coverageResult.result === 'OK' ? coverageResult.prefixes : [],
      }), { status: 200, headers })
    }

    // GET /settings
    if (method === 'GET' && path === 'settings') {
      const { data: settings } = await supabaseAdmin.from('sms_settings').select('*').eq('id', 1).single()
      if (!settings) {
        return new Response(JSON.stringify({ error: 'Settings not found' }), { status: 404, headers })
      }
      // Mask credentials
      const masked = {
        ...settings,
        kwtsms_username: settings.kwtsms_username ? '***' : null,
        kwtsms_password: settings.kwtsms_password ? '***' : null,
      }
      return new Response(JSON.stringify(masked), { status: 200, headers })
    }

    // PUT /settings
    if (method === 'PUT' && path === 'settings') {
      const updates = await req.json()
      // Only allow updating specific fields with type validation
      const allowed: Record<string, unknown> = {}
      const allowedKeys = ['sender_id', 'default_country_code', 'test_mode', 'gateway_enabled', 'debug_logging']
      for (const key of allowedKeys) {
        if (key in updates) {
          const val = updates[key]
          // Type validation
          if (key === 'sender_id' && (typeof val !== 'string' || val.length === 0 || val.length > 50)) continue
          if (key === 'default_country_code' && (typeof val !== 'string' || !/^\d{1,4}$/.test(val))) continue
          if (key === 'test_mode' && typeof val !== 'boolean') continue
          if (key === 'gateway_enabled' && typeof val !== 'boolean') continue
          if (key === 'debug_logging' && typeof val !== 'boolean') continue
          allowed[key] = val
        }
      }

      if (Object.keys(allowed).length === 0) {
        return new Response(JSON.stringify({ error: 'No valid fields to update' }), { status: 400, headers })
      }

      const { error: updateErr } = await supabaseAdmin.from('sms_settings').update(allowed).eq('id', 1)
      if (updateErr) {
        return new Response(JSON.stringify({ error: updateErr.message }), { status: 500, headers })
      }

      log(ctx, 'Settings updated', { fields: Object.keys(allowed) })
      return new Response(JSON.stringify({ result: 'OK' }), { status: 200, headers })
    }

    // GET /templates
    if (method === 'GET' && path === 'templates') {
      const { data: templates } = await supabaseAdmin.from('sms_templates').select('*').order('slug')
      return new Response(JSON.stringify(templates || []), { status: 200, headers })
    }

    // PUT /templates/:slug
    if (method === 'PUT' && path.startsWith('templates/') && !path.includes('reset')) {
      const slug = path.replace('templates/', '')
      if (!SLUG_PATTERN.test(slug)) {
        return new Response(JSON.stringify({ error: 'Invalid slug format' }), { status: 400, headers })
      }

      const { body_en, body_ar } = await req.json()
      const updates: Record<string, string> = {}
      if (body_en !== undefined) updates.body_en = body_en
      if (body_ar !== undefined) updates.body_ar = body_ar

      if (Object.keys(updates).length === 0) {
        return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400, headers })
      }

      // Verify template exists
      const { data: existing } = await supabaseAdmin.from('sms_templates').select('id').eq('slug', slug).single()
      if (!existing) {
        return new Response(JSON.stringify({ error: `Template not found: ${slug}` }), { status: 404, headers })
      }

      const { error: updateErr } = await supabaseAdmin.from('sms_templates').update(updates).eq('slug', slug)
      if (updateErr) {
        return new Response(JSON.stringify({ error: updateErr.message }), { status: 500, headers })
      }

      log(ctx, 'Template updated', { slug })
      return new Response(JSON.stringify({ result: 'OK' }), { status: 200, headers })
    }

    // POST /templates/:slug/reset
    if (method === 'POST' && path.match(/^templates\/[^/]+\/reset$/)) {
      const slug = path.replace('templates/', '').replace('/reset', '')
      if (!SLUG_PATTERN.test(slug)) {
        return new Response(JSON.stringify({ error: 'Invalid slug format' }), { status: 400, headers })
      }

      const { data: tmpl } = await supabaseAdmin.from('sms_templates').select('default_body_en, default_body_ar').eq('slug', slug).single()
      if (!tmpl) {
        return new Response(JSON.stringify({ error: `Template not found: ${slug}` }), { status: 404, headers })
      }

      const { error: resetErr } = await supabaseAdmin.from('sms_templates').update({
        body_en: tmpl.default_body_en,
        body_ar: tmpl.default_body_ar,
      }).eq('slug', slug)

      if (resetErr) {
        return new Response(JSON.stringify({ error: resetErr.message }), { status: 500, headers })
      }

      log(ctx, 'Template reset', { slug })
      return new Response(JSON.stringify({ result: 'OK' }), { status: 200, headers })
    }

    // POST /templates/reset (reset ALL)
    if (method === 'POST' && path === 'templates/reset') {
      const { data: templates } = await supabaseAdmin.from('sms_templates').select('slug, default_body_en, default_body_ar')
      let resetCount = 0
      const errors: string[] = []
      if (templates) {
        for (const tmpl of templates) {
          const { error: resetErr } = await supabaseAdmin.from('sms_templates').update({
            body_en: tmpl.default_body_en,
            body_ar: tmpl.default_body_ar,
          }).eq('slug', tmpl.slug)
          if (resetErr) {
            errors.push(`${tmpl.slug}: ${resetErr.message}`)
          } else {
            resetCount++
          }
        }
      }
      log(ctx, 'All templates reset to defaults', { resetCount, errors: errors.length })
      if (errors.length > 0) {
        return new Response(JSON.stringify({ result: 'PARTIAL', resetCount, errors }), { status: 207, headers })
      }
      return new Response(JSON.stringify({ result: 'OK', resetCount }), { status: 200, headers })
    }

    // GET /logs
    if (method === 'GET' && path === 'logs') {
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1') || 1)
      const limit = Math.min(Math.max(1, parseInt(url.searchParams.get('limit') || '50') || 50), 100)
      const offset = (page - 1) * limit

      const { data: logs, count } = await supabaseAdmin
        .from('sms_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      return new Response(JSON.stringify({ logs: logs || [], total: count, page, limit }), { status: 200, headers })
    }

    // DELETE /logs
    if (method === 'DELETE' && path === 'logs') {
      const body = await req.json().catch(() => ({}))
      let query = supabaseAdmin.from('sms_log').delete()

      if (body.before) {
        query = query.lt('created_at', body.before)
      }
      if (body.after) {
        query = query.gt('created_at', body.after)
      }
      if (!body.before && !body.after) {
        // Delete all: need a condition, use gt with epoch
        query = query.gt('created_at', '1970-01-01')
      }

      const { error: deleteErr } = await query
      if (deleteErr) {
        return new Response(JSON.stringify({ error: deleteErr.message }), { status: 500, headers })
      }

      log(ctx, 'Logs cleared', { before: body.before, after: body.after })
      return new Response(JSON.stringify({ result: 'OK' }), { status: 200, headers })
    }

    // GET /balance
    if (method === 'GET' && path === 'balance') {
      const { data: settings } = await supabaseAdmin.from('sms_settings').select('cached_balance, cached_purchased, balance_synced_at').eq('id', 1).single()
      return new Response(JSON.stringify(settings || {}), { status: 200, headers })
    }

    // POST /balance/sync
    if (method === 'POST' && path === 'balance/sync') {
      const { data: settings } = await supabaseAdmin.from('sms_settings').select('kwtsms_username, kwtsms_password').eq('id', 1).single()
      if (!settings?.kwtsms_username || !settings?.kwtsms_password) {
        return new Response(JSON.stringify({ error: 'Credentials not configured' }), { status: 400, headers })
      }

      const result = await getBalance(settings.kwtsms_username, settings.kwtsms_password)
      if (result.result === 'OK') {
        await supabaseAdmin.from('sms_settings').update({
          cached_balance: result.available,
          cached_purchased: result.purchased,
          balance_synced_at: new Date().toISOString(),
        }).eq('id', 1)
      }

      return new Response(JSON.stringify(result), { status: 200, headers })
    }

    // POST /test-gateway (supports comma-separated numbers)
    if (method === 'POST' && path === 'test-gateway') {
      const { phone, message } = await req.json()
      if (!phone) {
        return new Response(JSON.stringify({ error: 'Phone number required' }), { status: 400, headers })
      }

      const { data: settings } = await supabaseAdmin.from('sms_settings').select('*').eq('id', 1).single()
      if (!settings?.kwtsms_username || !settings?.kwtsms_password) {
        return new Response(JSON.stringify({ error: 'Credentials not configured' }), { status: 400, headers })
      }

      const phones = phone.split(',').map((p: string) => p.trim()).filter((p: string) => p)
      if (phones.length === 0) {
        return new Response(JSON.stringify({ error: 'Phone number required' }), { status: 400, headers })
      }

      const results = []
      for (const p of phones) {
        const resp = await processAndSend({
          phone: p,
          message: message || 'kwtSMS gateway test message',
          senderId: settings.sender_id || 'KWT-SMS',
          username: settings.kwtsms_username,
          password: settings.kwtsms_password,
          testMode: settings.test_mode,
          defaultCountryCode: settings.default_country_code,
          coverage: settings.coverage,
        })
        results.push({ phone: resp.phone, ok: resp.ok, result: resp.result || null, error: resp.errorMessage || null })
      }

      // Single number: return simple response (backward compatible)
      if (results.length === 1) {
        const r = results[0]
        if (r.ok && r.result) return new Response(JSON.stringify(r.result), { status: 200, headers })
        if (r.result) return new Response(JSON.stringify(r.result), { status: 200, headers })
        return new Response(JSON.stringify({ error: r.error }), { status: 400, headers })
      }

      // Multiple numbers: return array
      return new Response(JSON.stringify({ results }), { status: 200, headers })
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers })

  } catch (err) {
    logError(ctx, 'Unhandled error', { error: (err as Error).message })
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers })
  }
})
