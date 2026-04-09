// sms-dashboard: Admin dashboard UI + API proxy
// Serves SPA on GET, proxies /api/* to sms-admin with service_role auth
// All API calls require valid Supabase Auth JWT
// Related: sms-admin/index.ts, _shared/db.ts

import { HTML } from './html.ts'
import { supabaseAdmin } from '../_shared/db.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SERVICE_ROLE_JWT = Deno.env.get('SERVICE_ROLE_JWT') || SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

async function verifyAuth(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    return !error && !!user
  } catch {
    return false
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const path = url.pathname.replace('/sms-dashboard', '').replace(/^\/+/, '')

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  // Auth endpoint: login via Supabase Auth
  if (path === 'api/auth' && req.method === 'POST') {
    const { email, password } = await req.json()
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }
    try {
      const resp = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY || SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await resp.json()
      if (!resp.ok || data.error) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
        )
      }
      return new Response(
        JSON.stringify({ access_token: data.access_token, user: { email: data.user?.email } }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    } catch {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }
  }

  // API proxy: forward /api/* to sms-admin or REST API
  if (path.startsWith('api/')) {
    // Verify Supabase Auth JWT
    const authenticated = await verifyAuth(req)
    if (!authenticated) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }
    return handleApiProxy(req, path.slice(4), url.search)
  }

  // Redirect to dashboard with project URL pre-filled
  const dashboardUrl = 'https://boxlinknet.github.io/kwtsms-supabase/?project=' + encodeURIComponent(SUPABASE_URL)
  return Response.redirect(dashboardUrl, 302)
})

async function handleApiProxy(req: Request, apiPath: string, search: string): Promise<Response> {
  const isRestApi = apiPath.startsWith('admin-recipients')
  const authKey = isRestApi ? SERVICE_ROLE_KEY : SERVICE_ROLE_JWT
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${authKey}`,
    'apikey': SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
  }

  let targetUrl: string
  const method = req.method

  if (isRestApi) {
    const restBase = `${SUPABASE_URL}/rest/v1/sms_admin_recipients`
    if (apiPath === 'admin-recipients' && method === 'GET') {
      targetUrl = `${restBase}?select=*&order=created_at.desc`
    } else if (apiPath === 'admin-recipients' && method === 'POST') {
      targetUrl = restBase
      headers['Prefer'] = 'return=representation'
    } else if (apiPath.match(/^admin-recipients\/[a-f0-9-]+$/) && method === 'PATCH') {
      const id = apiPath.split('/')[1]
      targetUrl = `${restBase}?id=eq.${id}`
      headers['Prefer'] = 'return=representation'
    } else if (apiPath.match(/^admin-recipients\/[a-f0-9-]+$/) && method === 'DELETE') {
      const id = apiPath.split('/')[1]
      targetUrl = `${restBase}?id=eq.${id}`
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: CORS_HEADERS })
    }
  } else {
    targetUrl = `${SUPABASE_URL}/functions/v1/sms-admin/${apiPath}${search}`
  }

  try {
    const body = ['GET', 'HEAD'].includes(method) ? undefined : await req.text()
    const resp = await fetch(targetUrl, { method, headers, body })
    const respBody = await resp.text()
    return new Response(respBody, {
      status: resp.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Proxy error' }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }
}
