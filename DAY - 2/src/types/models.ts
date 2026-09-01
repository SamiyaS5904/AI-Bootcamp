/**
 * Domain models — the shapes the UI works with.
 *
 * These mirror the Supabase tables in `supabase/migrations/` but are declared
 * here by hand so the app is typed before `supabase gen types` has ever been
 * run. Each query in `src/features/*\/api/` uses `.returns<T>()` to pin its
 * result to one of these, so a renamed column surfaces as a compile error at
 * the query rather than as `undefined` in a component.
 *
 * Money is always whole rupees (integer), matching `products.price`. Paise
 * conversion happens once, inside the Razorpay Edge Function.
 */

export type FitType = 'slim' | 'regular' | 'relaxed'

export const FIT_TYPES: readonly FitType[] = ['slim', 'regular', 'relaxed']

export type OrderStatus =
  'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export type Category = {
  id: string
  name: string
  slug: string
  position: number
}

export type ProductImage = {
  id: string
  url: string
  position: number
  alt_text: string
}

export type ProductVariant = {
  id: string
  size: string
  color: string
  stock_qty: number
  sku: string
}

/** A product as the shop grid needs it: enough to render a card, no more. */
export type ProductSummary = {
  id: string
  name: string
  slug: string
  price: number
  /** MRP this is discounted from, whole rupees. null = not on sale. */
  compare_at_price: number | null
  fit_type: FitType
  /**
   * Whether the brand has confirmed `fit_type`. False means it was inferred
   * from the garment type and must not be presented as fact — the Style
   * Assistant filters on it, so a wrong value gives a wrong recommendation.
   */
  fit_confirmed: boolean
  created_at: string
  category: Pick<Category, 'id' | 'name' | 'slug'>
  images: ProductImage[]
  variants: ProductVariant[]
}

/** A product as the PDP needs it: everything, including the fit/fabric detail. */
export type Product = ProductSummary & {
  description: string
  fabric: string
  fit_type: FitType
  care_instructions: string
}

export type SizeChartEntry = {
  id: string
  category_id: string
  size_label: string
  /** e.g. { chest_in: 40, waist_in: 34, length_in: 28 } */
  measurements: Record<string, number>
  position: number
}

export type Address = {
  id: string
  name: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  country: string
  is_default: boolean
}

/** The address fields a checkout form collects. No id — not saved yet. */
export type AddressInput = Omit<Address, 'id' | 'is_default'>

export type CustomerProfile = {
  id: string
  name: string | null
  phone: string | null
}

/** A cart line joined to enough product data to render it. */
export type CartLine = {
  id: string
  qty: number
  variant: ProductVariant & {
    product: Pick<ProductSummary, 'id' | 'name' | 'slug' | 'price'> & {
      image: ProductImage | null
    }
  }
}

export type OrderLine = {
  id: string
  product_name: string
  variant_size: string
  variant_color: string
  qty: number
  price_at_purchase: number
}

export type Order = {
  id: string
  order_number: string
  status: OrderStatus
  contact_email: string
  contact_phone: string
  shipping_name: string
  shipping_line1: string
  shipping_line2: string | null
  shipping_city: string
  shipping_state: string
  shipping_pincode: string
  subtotal: number
  shipping_fee: number
  total: number
  created_at: string
  paid_at: string | null
  items: OrderLine[]
}

/** What the Style Assistant flow collects before calling the Edge Function. */
export type StyleAssistantAnswers = {
  /** null = "not sure, surprise me" */
  category: string | null
  occasion: 'everyday' | 'office' | 'evening' | 'layering'
  fit: FitType
  /** null = size unknown; the Size Finder branch fills this in. */
  size: string | null
  /** null = skipped. Whole rupees. */
  budgetMax: number | null
}

/** One recommendation from the Style Assistant. */
export type Recommendation = {
  /** The full product, so the results screen can render a normal product card. */
  product: Product
  /** One plain-language line on why this piece suits the answers given. */
  reason: string
}
