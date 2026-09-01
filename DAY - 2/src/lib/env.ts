/**
 * Validated access to client-side environment variables.
 *
 * Only VITE_-prefixed variables exist in the browser bundle — see .env.example
 * for why. Failing loudly at startup beats a confusing `undefined` deep inside
 * a Supabase call.
 */

type ClientEnv = {
  supabaseUrl: string
  supabaseAnonKey: string
  /** Razorpay *Key ID* — the public half. The secret lives in an Edge Function. */
  razorpayKeyId: string | undefined
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Copy .env.example to .env.local and fill it in, then restart the dev server.`,
    )
  }
  return value
}

export const env: ClientEnv = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
  // Optional at boot: only the checkout flow needs it, and that isn't built yet.
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
}
