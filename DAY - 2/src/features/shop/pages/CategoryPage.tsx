import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { categories, getCategoryBySlug, products as allProducts } from '@/data/catalog'
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
          {`{{TODO: copy needed — category intro for ${category.name}: fabric and fit philosophy}}`}
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
            short grid. */}
        <section className="border-border mt-16 border-t pt-16">
          <p className="eyebrow text-clay">Keep looking</p>
          <h2 className="font-display mt-4 text-2xl md:text-3xl">The rest of the collection</h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 md:gap-6">
            {others.map((other) => {
              const cover = categoryCovers[other.slug]
              const inCategory = allProducts.filter((p) => p.category.slug === other.slug)
              const from = Math.min(...inCategory.map((p) => p.price))

              return (
                <Link
                  key={other.slug}
                  to={`/shop/${other.slug}`}
                  className="group focus-visible:ring-ring block rounded-md focus-visible:ring-2 focus-visible:ring-offset-4"
                >
                  <div className="bg-bone-sunk relative aspect-16/10 overflow-hidden rounded-md">
                    {cover && (
                      <img
                        src={cover.url}
                        alt={cover.alt}
                        loading="lazy"
                        className="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    )}
                    <div
                      className="from-ink/80 absolute inset-0 bg-gradient-to-t to-transparent"
                      aria-hidden
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="text-bone/70 eyebrow">
                        {inCategory.length} {inCategory.length === 1 ? 'piece' : 'pieces'} · from{' '}
                        {formatPrice(from)}
                      </p>
                      <h3 className="text-bone font-display mt-1.5 flex items-center gap-2 text-xl">
                        {other.name}
                        <ArrowRight
                          className="size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </h3>
                    </div>
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
