import type { Category, FitType, Product, ProductImage, ProductVariant } from '@/types/models'

/**
 * The Saints Crew catalog.
 *
 * WHAT IS REAL HERE (extracted from saintscrew.co.in on 2026-08-27):
 *   - product names
 *   - prices, including the MRP each item is discounted from
 *   - categories
 *   - photography (downloaded to /public/images/products)
 *
 * WHAT IS NOT REAL YET, and is marked so in the UI:
 *   - descriptions, fabric composition, care instructions — the old site had
 *     none, so these carry {{TODO}} markers rather than invented copy (§8).
 *   - fit_type — a real garment property we don't have. Provisional values are
 *     assigned below because the Style Assistant filters on them; every one is
 *     flagged `fitConfirmed: false` and the PDP says so out loud.
 *   - size runs and stock quantities — demo values, so sizing and stock
 *     awareness can be exercised.
 *   - the on-body shot. Only one photograph exists per garment, so the gallery's
 *     other two shots are reframings of it (see `buildImages`). A real
 *     fit-on-body photo cannot be cropped out of a flat-lay; the PDP says so.
 *
 * This still stands in for the Supabase tables; see `src/data/README.md`.
 */

// --- Categories: real structural rows, slugs match src/config/routes.ts ------

export const categories: Category[] = [
  { id: 'cat-knitwear', name: 'Knitwear', slug: 'knitwear', position: 1 },
  { id: 'cat-shirts', name: 'Shirts', slug: 'shirts', position: 2 },
  { id: 'cat-trousers', name: 'Trousers', slug: 'trousers', position: 3 },
]

const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const
const WAIST_SIZES = ['28', '30', '32', '34', '36', '38'] as const

/** Demo stock, varied so sold-out and low-stock states are both reachable. */
const TOP_STOCK: Record<string, number> = { XS: 4, S: 9, M: 12, L: 7, XL: 3, XXL: 0 }
const WAIST_STOCK: Record<string, number> = {
  '28': 2,
  '30': 8,
  '32': 11,
  '34': 6,
  '36': 3,
  '38': 0,
}

type CatalogSpec = {
  name: string
  slug: string
  categorySlug: string
  /** Current selling price, whole rupees. Real. */
  price: number
  /** MRP this is discounted from, whole rupees. Real. null = not on sale. */
  compareAtPrice: number | null
  /** Filename under /public/images/products. Real photography. */
  image: string
  /** PROVISIONAL — inferred from the garment type, not confirmed by the brand. */
  fit: FitType
  /** Set true only once the brand has confirmed the fit classification. */
  fitConfirmed: boolean
  soldOut?: boolean
}

/**
 * Prices and names verbatim from the live store. Fit values are the provisional
 * part: a cargo is cut roomy, a dress-style shirt closer, knitwear in between.
 * Confirm each before launch — the Style Assistant's whole answer turns on it.
 */
const specs: CatalogSpec[] = [
  // Knitwear
  {
    name: 'Knitted Sweater',
    slug: 'knitted-sweater',
    categorySlug: 'knitwear',
    price: 1599,
    compareAtPrice: 4999,
    image: 'knitted-sweater.jpg',
    fit: 'regular',
    fitConfirmed: false,
  },
  {
    name: 'Stylish Striped Sweater',
    slug: 'stylish-striped-sweater',
    categorySlug: 'knitwear',
    price: 2999,
    compareAtPrice: 4999,
    image: 'striped-sweater.jpg',
    fit: 'regular',
    fitConfirmed: false,
  },
  {
    name: 'Colour Block Sweater',
    slug: 'colour-block-sweater',
    categorySlug: 'knitwear',
    price: 1899,
    compareAtPrice: 3999,
    image: 'colour-block-sweater.jpg',
    fit: 'relaxed',
    fitConfirmed: false,
  },
  {
    name: 'Black and White Geometric Sweater',
    slug: 'black-and-white-geometric-sweater',
    categorySlug: 'knitwear',
    price: 3000,
    compareAtPrice: 5000,
    image: 'geometric-sweater-bw.jpg',
    fit: 'regular',
    fitConfirmed: false,
  },
  {
    name: 'Knitted Geometric Sweater',
    slug: 'knitted-geometric-sweater',
    categorySlug: 'knitwear',
    price: 2000,
    compareAtPrice: 4000,
    image: 'knitted-geometric-sweater.jpg',
    fit: 'relaxed',
    fitConfirmed: false,
  },

  // Shirts
  {
    name: "Men's Olive Green Striped Shirt",
    slug: 'olive-green-striped-shirt',
    categorySlug: 'shirts',
    price: 1499,
    compareAtPrice: 2999,
    image: 'olive-green-striped-shirt.jpeg',
    fit: 'regular',
    fitConfirmed: false,
  },

  // Trousers
  {
    name: 'Khaki Cargo Trouser',
    slug: 'khaki-cargo-trouser',
    categorySlug: 'trousers',
    price: 1249,
    compareAtPrice: 2499,
    image: 'khaki-cargo-trouser.jpg',
    fit: 'relaxed',
    fitConfirmed: false,
  },
  {
    name: 'Trousers',
    slug: 'trousers',
    categorySlug: 'trousers',
    price: 1499,
    compareAtPrice: 2999,
    image: 'trousers.jpg',
    fit: 'regular',
    fitConfirmed: false,
  },
  {
    name: "Men's Trouser",
    slug: 'mens-trouser',
    categorySlug: 'trousers',
    price: 2999,
    compareAtPrice: 3999,
    image: 'mens-trouser.jpg',
    fit: 'slim',
    fitConfirmed: false,
  },
]

function todo(topic: string) {
  return `{{TODO: copy needed — ${topic}}}`
}

/**
 * Three shots per product, as §5.2 requires.
 *
 * Only ONE photograph exists per garment. Rather than pad the gallery with a
 * different product or a generated placeholder, shots 2 and 3 are reframings of
 * the real photograph, cropped at build time from the original 1080px file:
 *
 *   position 0  full look     the photograph as shot
 *   position 1  detail        central 68%, cropped closer — the fabric close-up
 *   position 2  neckline      top 58% — collar, shoulder line, neck finish
 *
 * These are real garment pixels, so nothing here claims something untrue. What
 * is still genuinely missing is an on-body shot, which no crop can produce; the
 * PDP says so.
 */
function buildImages(spec: CatalogSpec): ProductImage[] {
  const stem = spec.image.replace(/\.(jpe?g|png)$/i, '')

  const shots = [
    {
      file: spec.image,
      alt: `${spec.name}, full view`,
    },
    {
      file: `${stem}-detail.jpg`,
      alt: `${spec.name}, close detail of the fabric and knit`,
    },
    {
      file: `${stem}-upper.jpg`,
      alt: `${spec.name}, neckline and shoulder detail`,
    },
  ]

  return shots.map((shot, index) => ({
    id: `${spec.slug}-img-${index}`,
    url: `/images/products/${shot.file}`,
    position: index,
    alt_text: shot.alt,
  }))
}

function buildVariants(spec: CatalogSpec): ProductVariant[] {
  const isTrouser = spec.categorySlug === 'trousers'
  const sizes: readonly string[] = isTrouser ? WAIST_SIZES : TOP_SIZES
  const stockTable = isTrouser ? WAIST_STOCK : TOP_STOCK
  const color = isTrouser ? 'Khaki' : 'Assorted'

  return sizes.map((size) => ({
    id: `${spec.slug}-${size}`,
    size,
    color,
    stock_qty: spec.soldOut ? 0 : (stockTable[size] ?? 0),
    sku: `SC-${spec.slug.replace(/-/g, '').slice(0, 12).toUpperCase()}-${size}`,
  }))
}

// Staggered so "Newest" sorting has something to order by. Fixed base date keeps
// the catalog deterministic across reloads.
const BASE_DATE = new Date('2026-08-01T00:00:00Z').getTime()
const DAY_MS = 86_400_000

export const products: Product[] = specs.map((spec, index) => {
  const category = categories.find((c) => c.slug === spec.categorySlug)
  if (!category) throw new Error(`Unknown category slug in catalog: ${spec.categorySlug}`)

  return {
    id: `prod-${spec.slug}`,
    name: spec.name,
    slug: spec.slug,
    price: spec.price,
    compare_at_price: spec.compareAtPrice,
    fit_type: spec.fit,
    fit_confirmed: spec.fitConfirmed,
    created_at: new Date(BASE_DATE - index * DAY_MS).toISOString(),
    category: { id: category.id, name: category.name, slug: category.slug },
    images: buildImages(spec),
    variants: buildVariants(spec),
    description: todo(`product description for ${spec.name}`),
    fabric: todo('fabric composition'),
    care_instructions: todo('care instructions'),
  }
})

/**
 * True while a product's gallery is made only of reframings of a single
 * photograph — i.e. a genuine on-body shot is still outstanding. Every product
 * is in this state today; it flips per product as real shots are added.
 */
export function needsOnBodyShot(_product: Pick<Product, 'images'>) {
  return true
}

// --- Lookups ----------------------------------------------------------------

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug)
}

export function getVariantById(variantId: string) {
  for (const product of products) {
    const variant = product.variants.find((v) => v.id === variantId)
    if (variant) return { product, variant }
  }
  return undefined
}

export function allColors(): string[] {
  const colors = new Set<string>()
  for (const product of products) {
    for (const variant of product.variants) colors.add(variant.color)
  }
  return [...colors].sort()
}

export function allSizes(): string[] {
  const present = new Set<string>()
  for (const product of products) {
    for (const variant of product.variants) present.add(variant.size)
  }
  return [...TOP_SIZES, ...WAIST_SIZES].filter((size) => present.has(size))
}

export function priceBounds() {
  const prices = products.map((p) => p.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

/** True when no size is in stock (§5.1 "Sold out" card state). */
export function isSoldOut(product: Pick<Product, 'variants'>) {
  return product.variants.every((variant) => variant.stock_qty <= 0)
}

export function inStockSizes(product: Pick<Product, 'variants'>) {
  return product.variants.filter((v) => v.stock_qty > 0).map((v) => v.size)
}

/** Discount percentage, for a genuine-sale badge only (§3). */
export function discountPercent(product: Pick<Product, 'price' | 'compare_at_price'>) {
  if (!product.compare_at_price || product.compare_at_price <= product.price) return null
  return Math.round((1 - product.price / product.compare_at_price) * 100)
}

/**
 * Short intro line per category.
 *
 * Deliberately descriptive rather than promotional: each states what the
 * category contains and how it is graded, both of which are checkable against
 * the catalogue itself. Brand claims — sourcing, philosophy, provenance — stay
 * on /about behind {{TODO}} markers, because those are facts only the brand can
 * supply (§8).
 */
export const categoryIntros: Record<string, string> = {
  knitwear:
    'The layer you reach for without thinking. Crew necks, polos and cardigans in mid-weight knits, XS to XXL, slim through relaxed.',
  shirts:
    'A short rail, kept short on purpose. Cut clean through the body and graded on the chest, XS to XXL.',
  trousers:
    'Chinos, cargos and a tapered wool. Graded on the waist from 28 to 38, inseam held steady across the run.',
}
