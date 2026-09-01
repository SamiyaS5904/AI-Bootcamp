/**
 * Brand identity, contact details and social links — the SINGLE source of truth.
 *
 * CLAUDE.md §5.12: the previous site shipped a header pointing at the real
 * Instagram handle while the footer pointed at instagram.com. That is a
 * duplication bug, so nothing here may be hardcoded a second time. Header,
 * footer and the Contact page all read from this file.
 *
 * CLAUDE.md §8: values we don't have yet are `PENDING`, not invented. A
 * `PENDING` value renders as a visible {{TODO}} marker and produces NO link —
 * it can never be mistaken for real contact info if this ships by accident.
 *
 * NOT HERE ON PURPOSE: the free-shipping threshold and any other number shown
 * to a customer. Those live in the `site_config` table (CLAUDE.md §5.3, §6) so
 * they can be corrected without a redeploy.
 */

/** Marks a value that is genuinely not known yet. Never substitute a guess. */
export const PENDING = null
export type Pending = null

/** A value that is either real or explicitly pending. */
export type Maybe<T> = T | Pending

export const siteConfig = {
  name: 'Saints Crew',
  /** Used in <title> as "Page — Saints Crew". */
  titleSuffix: 'Saints Crew',
  tagline: 'Considered menswear',
  description:
    "Knitwear, shirts and trousers with real fit and fabric guidance, so you know what you're buying before it arrives.",

  contact: {
    /**
     * PLACEHOLDER, set for the demo at the client's request. Not a real inbox —
     * swap before launch. CLAUDE.md §8 warns against exactly this, and the old
     * site shipped `info@feyer.com`; the difference is that this one is a known
     * stand-in tracked in DECISIONS.md, not a forgotten template value.
     */
    email: 'hello@saintscrew.co.in' as Maybe<string>,
    /** PLACEHOLDER — deliberately an obvious dummy number. Swap before launch. */
    phone: '+91 99999 99999' as Maybe<string>,
    /**
     * PLACEHOLDER, matching the dummy phone above. Digits only, country code,
     * no '+'. §5.10 forbids a bare wa.me link with no number, so this at least
     * produces a well-formed link — it just doesn't reach anyone yet.
     */
    whatsappNumber: '919999999999' as Maybe<string>,
  },

  social: {
    /**
     * Real, taken from the live site's header link on 2026-08-27.
     * The old footer pointed at instagram.com instead — the §5.12 bug this
     * single source of truth exists to prevent.
     */
    instagramHandle: 'saintscrewoutfits' as Maybe<string>,
  },
} as const

/** Full Instagram profile URL, or null if the handle isn't known yet. */
export function instagramUrl(): string | null {
  const handle = siteConfig.social.instagramHandle
  return handle ? `https://instagram.com/${handle}` : null
}

/** Clickable WhatsApp chat URL, or null if the number isn't known yet. */
export function whatsappUrl(message?: string): string | null {
  const number = siteConfig.contact.whatsappNumber
  if (!number) return null
  const query = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${query}`
}

/** `mailto:` URL, or null if the address isn't known yet. */
export function emailUrl(): string | null {
  const email = siteConfig.contact.email
  return email ? `mailto:${email}` : null
}

/** `tel:` URL, or null if the number isn't known yet. */
export function telUrl(): string | null {
  const phone = siteConfig.contact.phone
  return phone ? `tel:${phone}` : null
}
