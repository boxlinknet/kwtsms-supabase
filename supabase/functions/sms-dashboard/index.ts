// sms-dashboard: Admin dashboard UI + API proxy
// Serves SPA on GET, proxies /api/* to sms-admin with service_role auth
// Related: sms-admin/index.ts, _shared/db.ts

import { HTML } from './html.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
// JWT-format key for Edge Function auth (sb_secret_ format doesn't work with verify_jwt)
const SERVICE_ROLE_JWT = Deno.env.get('SERVICE_ROLE_JWT') || SERVICE_ROLE_KEY

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const path = url.pathname.replace('/sms-dashboard', '').replace(/^\/+/, '')

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  // API proxy: forward /api/* to sms-admin or REST API
  if (path.startsWith('api/')) {
    return handleApiProxy(req, path.slice(4), url.search)
  }

  // Serve the SPA HTML
  return new Response(HTML, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src https://www.kwtsms.com; connect-src 'self'",
      'X-Content-Type-Options': 'nosniff',
    },
  })
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

  // Admin recipients go to REST API
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
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }
  } else {
    // Everything else goes to sms-admin Edge Function
    targetUrl = `${SUPABASE_URL}/functions/v1/sms-admin/${apiPath}${search}`
  }

  try {
    const body = ['GET', 'HEAD'].includes(method) ? undefined : await req.text()
    const resp = await fetch(targetUrl, { method, headers, body })
    const respBody = await resp.text()
    return new Response(respBody, {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Proxy error' }),
      { status: 502, headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      } },
    )
  }
}
