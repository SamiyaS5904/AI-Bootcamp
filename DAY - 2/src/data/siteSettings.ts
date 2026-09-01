/**
 * Customer-facing numbers — the single source of truth for phase 1.
 *
 * Stands in for the `site_config` table (CLAUDE.md §5.3, §6) and holds the
 * values confirmed on 2026-08-27 (DECISIONS.md). The previous site showed ₹600
 * in one place and ₹6000 in another; this module exists so that cannot happen.
 *
 * NOTHING may read these numbers except through `useSiteSettings()`. Do not
 * copy a value into a component, a string, or a test. When Supabase is wired
 * up, `useSiteSettings` becomes a query against `site_config` and every
 * consumer keeps working unchanged.
 */

export type SiteSettings = {
  /** Order subtotal in whole rupees at which shipping becomes free. */
  freeShippingThresholdInr: number
  /** Flat shipping fee in whole rupees below the threshold. */
  standardShippingFeeInr: number
  /** Days after delivery within which a return can be raised. */
  returnsWindowDays: number
}

const settings: SiteSettings = {
  freeShippingThresholdInr: 2000,
  standardShippingFeeInr: 99,
  returnsWindowDays: 7,
}

/**
 * Reads the site settings.
 *
 * A hook rather than a plain export so the swap to a Supabase query (with
 * loading/error states) doesn't change a single call site.
 */
export function useSiteSettings(): SiteSettings {
  return settings
}
