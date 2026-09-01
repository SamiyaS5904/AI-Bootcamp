import { inStockSizes, isSoldOut, products } from '@/data/catalog'
import type { Occasion } from '@/features/style-assistant/lib/flow'
import type { FitType, Product, Recommendation, StyleAssistantAnswers } from '@/types/models'

/**
 * Style Assistant recommendation engine — CLAUDE.md §5.6.
 *
 * PHASE 1: runs entirely in the browser against the local catalog. §5.6's
 * long-term design puts this in an Edge Function calling the Anthropic API, but
 * that call was explicitly deferred, and the blueprint is already clear that
 * "the underlying logic is deterministic and grounded in the actual catalog" —
 * which is exactly what this is.
 *
 * The reason strings are assembled from real product attributes (fit type,
 * category, price, the size actually in stock). Nothing is invented, so no
 * recommendation can claim something the catalog doesn't support. When the Edge
 * Function lands, its job is to REPLACE the scoring below while keeping the
 * same `Recommendation[]` contract — the results screen won't change.
 */

/**
 * Which fits suit which occasion, and how strongly.
 *
 * These are editorial judgements about menswear, kept in one table so they can
 * be argued with and tuned rather than buried in conditionals.
 */
const OCCASION_FIT_AFFINITY: Record<Occasion, Partial<Record<FitType, number>>> = {
  everyday: { regular: 3, relaxed: 3, slim: 1 },
  office: { regular: 3, slim: 3, relaxed: 0 },
  evening: { slim: 3, regular: 2, relaxed: 1 },
  layering: { relaxed: 3, regular: 2, slim: 0 },
}

/** Which categories read best for each occasion. */
const OCCASION_CATEGORY_AFFINITY: Record<Occasion, Partial<Record<string, number>>> = {
  everyday: { knitwear: 2, shirts: 2, trousers: 2 },
  office: { shirts: 3, trousers: 3, knitwear: 1 },
  evening: { shirts: 3, knitwear: 2, trousers: 2 },
  layering: { knitwear: 3, shirts: 1, trousers: 0 },
}

const OCCASION_LABEL: Record<Occasion, string> = {
  everyday: 'everyday wear',
  office: 'the office',
  evening: 'an evening out',
  layering: 'layering',
}

type Scored = {
  product: Product
  score: number
  /** The size we can actually offer this customer, if any. */
  availableSize: string | null
}

function scoreProduct(product: Product, answers: StyleAssistantAnswers): Scored | null {
  // Hard filters first — these are not preferences, they are availability.
  if (isSoldOut(product)) return null
  if (answers.budgetMax !== null && product.price > answers.budgetMax) return null
  if (answers.category !== null && product.category.slug !== answers.category) return null

  const stocked = inStockSizes(product)

  // If they told us their size, we only recommend pieces we can actually ship
  // in it. Recommending a garment that isn't available in their size is the
  // purchase-hesitation problem this feature exists to remove.
  if (answers.size !== null && !stocked.includes(answers.size)) return null

  let score = 0

  // Fit is the strongest signal — it's what the customer explicitly asked for.
  if (product.fit_type === answers.fit) score += 6
  else if (isAdjacentFit(product.fit_type, answers.fit)) score += 2

  score += OCCASION_FIT_AFFINITY[answers.occasion][product.fit_type] ?? 0
  score += OCCASION_CATEGORY_AFFINITY[answers.occasion][product.category.slug] ?? 0

  // Gentle nudge toward well-stocked pieces, so a recommendation is unlikely to
  // sell out between seeing it and buying it.
  if (stocked.length >= 4) score += 1

  return {
    product,
    score,
    availableSize: answers.size ?? null,
  }
}

/** Regular sits between slim and relaxed, so it part-matches either. */
function isAdjacentFit(a: FitType, b: FitType) {
  const order: FitType[] = ['slim', 'regular', 'relaxed']
  return Math.abs(order.indexOf(a) - order.indexOf(b)) === 1
}

/**
 * Builds the one-line reason shown under each product card.
 *
 * Every clause is derived from a real field, and the sentence is assembled in a
 * fixed order so it always reads cleanly.
 */
function buildReason(scored: Scored, answers: StyleAssistantAnswers): string {
  const { product, availableSize } = scored
  const clauses: string[] = []

  if (product.fit_type === answers.fit) {
    clauses.push(`${capitalise(product.fit_type)} fit, exactly as you asked`)
  } else {
    clauses.push(`${capitalise(product.fit_type)} fit — close to the ${answers.fit} cut you wanted`)
  }

  clauses.push(`suits ${OCCASION_LABEL[answers.occasion]}`)

  if (availableSize) {
    clauses.push(`in stock in ${availableSize}`)
  } else {
    const stocked = inStockSizes(product)
    const first = stocked[0]
    if (stocked.length >= 4) clauses.push('available across most sizes')
    else if (first) clauses.push(`available in ${stocked.join(', ')}`)
  }

  return `${clauses.join(', ')}.`
}

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Returns 3–5 recommendations (§5.6), best first.
 *
 * Ties break on price ascending then name, so the same answers always produce
 * the same order — a customer who goes back and forth sees a stable result.
 */
export function recommendProducts(answers: StyleAssistantAnswers): Recommendation[] {
  const scored = products
    .map((product) => scoreProduct(product, answers))
    .filter((entry): entry is Scored => entry !== null)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (a.product.price !== b.product.price) return a.product.price - b.product.price
      return a.product.name.localeCompare(b.product.name)
    })

  return scored.slice(0, 5).map((entry) => ({
    product: entry.product,
    reason: buildReason(entry, answers),
  }))
}

/**
 * Which constraint emptied the results, so the UI can say something useful
 * instead of showing a blank screen (§5.1 applies the same rule to filters).
 */
export function diagnoseEmptyResult(answers: StyleAssistantAnswers): string {
  if (answers.size !== null) {
    const anyInSize = products.some((p) => inStockSizes(p).includes(answers.size as string))
    if (!anyInSize) return `Nothing is in stock in size ${answers.size} right now.`
  }
  if (answers.budgetMax !== null) {
    const anyInBudget = products.some(
      (p) => p.price <= (answers.budgetMax as number) && !isSoldOut(p),
    )
    if (!anyInBudget) return 'Nothing in the catalog falls under that budget yet.'
  }
  if (answers.category !== null) {
    return 'Nothing in that category matches the rest of your answers.'
  }
  return 'No piece in the current catalog matches every answer.'
}
