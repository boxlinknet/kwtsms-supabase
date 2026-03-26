// CORS headers for browser requests to Edge Functions
// Related: sms-admin/index.ts

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

export function corsResponse(): Response {
  return new Response('ok', { headers: corsHeaders })
}
