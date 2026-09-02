import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  categories,
  categoryIntros,
  getCategoryBySlug,
  products as allProducts,
} from '@/data/catalog'
import { categoryCovers } from '@/data/editorial'
import { ProductGrid } from '@/features/shop/components/ProductGrid'
import { ShopFilters } from '@/features/shop/components/ShopFilters'
import {
  applyFilters,
  applySort,
  explainEmpty,
  soldOutLast,
  type Filters,
  type SortOption,
} from '@/features/shop/lib/filtering'
import { NotFoundPage } from '@/features/errors/pages/NotFoundPage'
import { Seo } from '@/components/common/Seo'
import { formatPrice } from '@/lib/utils'

/**
 * Category view — CLAUDE.md §5.1 requires a real, shareable, bookmarkable URL
 * rather than a filter state hidden in a query param. The category is pinned
 * from the path and cannot be filtered away.
 */
export function CategoryPage() {
  const { category: slug } = useParams<{ category: string }>()
  const category = slug ? getCategoryBySlug(slug) : undefined

  const [filters, setFilters] = useState<Filters>({
    categories: slug ? [slug] : [],
    sizes: [],
    colors: [],
    maxPrice: null,
  })
  const [sort, setSort] = useState<SortOption>('newest')

  const visible = useMemo(
    () => soldOutLast(applySort(applyFilters(allProducts, filters), sort)),
    [filters, sort],
  )

  // An unknown slug is a 404, not an empty grid.
  if (!category || !slug) return <NotFoundPage />

  const resetToCategory = () =>
    setFilters({ categories: [slug], sizes: [], colors: [], maxPrice: null })

  const others = categories.filter((entry) => entry.slug !== slug)

  /**
   * A category holding only a piece or two is a real state of a small label's
   * catalogue, not an error. Rather than leave a near-empty grid looking
   * broken, we say the collection is small and send people onward.
   */
  const isSmall = visible.length > 0 && visible.length <= 2

  return (
    <>
      <Seo
        title={category.name}
        description={`Saints Crew ${category.name.toLowerCase()} — fabric, fit and real stock on every piece.`}
      />

      <div className="container-page py-14 md:py-20">
        <p className="eyebrow text-clay">Shop</p>
        <h1 className="text-display mt-4">{category.name}</h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed">
          {categoryIntros[category.slug]}
        </p>

        <div className="mt-12">
          <ShopFilters
            filters={filters}
            onChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            lockedCategory={slug}
            resultCount={visible.length}
          />

          <ProductGrid
            products={visible}
            emptyMessage={explainEmpty(allProducts, filters)}
            onResetFilters={resetToCategory}
          />
        </div>

        {isSmall && (
          <p className="text-muted-foreground border-border mt-14 border-t pt-8 text-sm leading-relaxed">
            A small collection on purpose — we would rather cut a few things well than fill a page.
            More {category.name.toLowerCase()} is in the works.
          </p>
        )}

        {/* Somewhere to go next, rather than a dead end at the bottom of a
            short grid. Styled to match the homepage category blocks: the
            garment, then its name — no gradient overlay, no hover arrow. */}
        <section className="border-border mt-20 border-t pt-16 md:mt-28">
          <p className="eyebrow text-muted-foreground">Keep looking</p>

          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 md:mt-12">
            {others.map((other) => {
              const cover = categoryCovers[other.slug]
              const inCategory = allProducts.filter((p) => p.category.slug === other.slug)
              const from = Math.min(...inCategory.map((p) => p.price))

              return (
                <Link
                  key={other.slug}
                  to={`/shop/${other.slug}`}
                  className="group focus-visible:ring-ring block focus-visible:ring-2 focus-visible:ring-offset-4"
                >
                  <div className="bg-bone-sunk aspect-16/10 overflow-hidden">
                    {cover && (
                      <img
                        src={cover.url}
                        alt={cover.alt}
                        loading="lazy"
                        className="size-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]"
                      />
                    )}
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h2 className="font-display text-xl md:text-2xl">{other.name}</h2>
                    <p className="text-muted-foreground text-xs">
                      {inCategory.length} {inCategory.length === 1 ? 'piece' : 'pieces'} · from{' '}
                      {formatPrice(from)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
