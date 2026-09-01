import type { SiteSettings } from '@/data/siteSettings'
import type { CartLine } from '@/types/models'

/**
 * All cart arithmetic, in one place.
 *
 * Cart page, cart drawer, checkout summary and the free-shipping progress bar
 * all call these — none of them does its own maths. That's what keeps the
 * subtotal shown in the drawer identical to the one on the checkout page.
 *
 * When Razorpay is wired up, the server must recompute all of this from the
 * database rather than trusting anything the client sends.
 */

export function lineSubtotal(line: CartLine) {
  return line.variant.product.price * line.qty
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((total, line) => total + lineSubtotal(line), 0)
}

export function cartItemCount(lines: CartLine[]) {
  return lines.reduce((count, line) => count + line.qty, 0)
}

export function shippingFee(subtotal: number, settings: SiteSettings) {
  if (subtotal <= 0) return 0
  return subtotal >= settings.freeShippingThresholdInr ? 0 : settings.standardShippingFeeInr
}

/** Rupees still needed to qualify for free shipping. 0 once qualified. */
export function amountToFreeShipping(subtotal: number, settings: SiteSettings) {
  return Math.max(0, settings.freeShippingThresholdInr - subtotal)
}

/** Progress toward free shipping, 0–1, for the cart progress bar. */
export function freeShippingProgress(subtotal: number, settings: SiteSettings) {
  if (settings.freeShippingThresholdInr <= 0) return 1
  return Math.min(1, subtotal / settings.freeShippingThresholdInr)
}

export type CartTotals = {
  subtotal: number
  shipping: number
  total: number
  itemCount: number
}

export function cartTotals(lines: CartLine[], settings: SiteSettings): CartTotals {
  const subtotal = cartSubtotal(lines)
  const shipping = shippingFee(subtotal, settings)
  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    itemCount: cartItemCount(lines),
  }
}
