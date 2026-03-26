// Supabase admin client (service_role, bypasses RLS)
// Used by all Edge Functions to read/write SMS tables
// Related: all Edge Function index.ts files

import { createClient } from 'npm:@supabase/supabase-js@2'

export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
