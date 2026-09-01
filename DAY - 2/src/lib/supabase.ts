import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import type { Database } from '@/types/database'

/**
 * The single Supabase client for the whole app.
 *
 * Import this — never call `createClient` anywhere else. A second client means a
 * second auth listener and two competing session refresh timers.
 *
 * Access is governed entirely by Row Level Security (see
 * supabase/migrations/*_rls.sql). Anything needing a server-side secret —
 * Razorpay order creation, the Style Assistant's Anthropic call — goes through
 * an Edge Function via `supabase.functions.invoke()`, per CLAUDE.md §2.
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
