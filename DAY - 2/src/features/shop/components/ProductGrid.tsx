import { Link } from 'react-router-dom'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { Button } from '@/components/ui/button'
import { routes } from '@/config/routes'
import type { Product } from '@/types/models'

/**
 * Product grid with a real empty state — CLAUDE.md §5.1 is explicit that a
 * filter combination returning nothing must explain itself and offer a way out,
 * never render a blank grid.
 */
export function ProductGrid({
  products,
  emptyMessage,
  onResetFilters,
}: {
  products: Product[]
  emptyMessage?: string | null
  onResetFilters?: () => void
}) {
  if (products.length === 0) {
    return (
      <div className="border-border mt-12 rounded-md border border-dashed px-6 py-20 text-center">
        <p className="font-display text-xl">Nothing here yet</p>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
          {emptyMessage ?? 'No piece matches what you have selected.'}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {onResetFilters && (
            <Button variant="primary" onClick={onResetFilters}>
              Clear filters
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to={routes.styleAssistant}>Ask the Style Assistant</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8 lg:gap-x-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
