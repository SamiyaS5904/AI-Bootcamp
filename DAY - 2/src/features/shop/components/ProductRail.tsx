import { Link } from 'react-router-dom'
import { isSoldOut, products } from '@/data/catalog'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { routes } from '@/config/routes'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/models'

/**
 * A short row of products, used to give an otherwise-empty page somewhere to
 * go — an empty bag, an empty wishlist, the end of a short category.
 *
 * A dead end is the worst thing an empty state can be. Rather than leave a
 * heading floating in white space, this offers real stock as the next step.
 */
export function ProductRail({
  title,
  subtitle,
  /** Products to exclude — e.g. the piece already on screen. */
  excludeIds = [],
  /** Restrict to one category. Omitted = anything in stock. */
  categorySlug,
  limit = 3,
  className,
}: {
  title: string
  subtitle?: string
  excludeIds?: string[]
  categorySlug?: string
  limit?: number
  className?: string
}) {
  const picks: Product[] = products
    .filter(
      (product) =>
        !isSoldOut(product) &&
        !excludeIds.includes(product.id) &&
        (!categorySlug || product.category.slug === categorySlug),
    )
    // Newest first, so a repeat visitor sees movement rather than the same
    // three pieces every time.
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)

  if (picks.length === 0) return null

  return (
    <section className={cn('border-border border-t pt-12 md:pt-16', className)}>
      <div className="flex items-baseline justify-between gap-6">
        <div>
          <h2 className="eyebrow text-muted-foreground">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        <Link
          to={routes.shop}
          className="eyebrow text-clay shrink-0 border-b border-current pb-1 transition-opacity hover:opacity-70"
        >
          All products
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 md:mt-12 md:grid-cols-3 md:gap-x-8">
        {picks.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
