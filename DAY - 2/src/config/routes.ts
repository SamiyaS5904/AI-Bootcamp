/**
 * Route paths as constants — CLAUDE.md §4 site map.
 *
 * Header, footer, router and every in-app link read from here, so a URL is
 * never spelled out as a string literal in two places.
 */

export const routes = {
  home: '/',
  shop: '/shop',
  shopCategory: (slug: string) => `/shop/${slug}`,
  product: (slug: string) => `/product/${slug}`,
  styleAssistant: '/style-assistant',
  sizeGuide: '/size-guide',
  cart: '/cart',
  checkout: '/checkout',
  orderConfirmation: (orderId: string) => `/order-confirmation/${orderId}`,
  account: '/account',
  wishlist: '/wishlist',
  about: '/about',
  shippingReturns: '/shipping-returns',
  privacyPolicy: '/privacy-policy',
  terms: '/terms',
  contact: '/contact',
} as const

/**
 * The three product categories (CLAUDE.md §2, §5.1).
 *
 * Duplicated here as navigation metadata only — the authoritative category rows
 * live in the Supabase `categories` table. These slugs must match that table's
 * `slug` column. Once the catalog is wired up, the nav should read categories
 * from Supabase and this list becomes the fallback ordering.
 */
export const categoryNav = [
  { slug: 'knitwear', label: 'Knitwear' },
  { slug: 'shirts', label: 'Shirts' },
  { slug: 'trousers', label: 'Trousers' },
] as const

export type CategorySlug = (typeof categoryNav)[number]['slug']
