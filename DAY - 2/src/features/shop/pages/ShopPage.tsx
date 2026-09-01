import { useMemo, useState } from 'react'
import { products as allProducts } from '@/data/catalog'
import { ProductGrid } from '@/features/shop/components/ProductGrid'
import { ShopFilters } from '@/features/shop/components/ShopFilters'
import {
  EMPTY_FILTERS,
  applyFilters,
  applySort,
  explainEmpty,
  soldOutLast,
  type Filters,
  type SortOption,
} from '@/features/shop/lib/filtering'
import { Seo } from '@/components/common/Seo'

/** Full catalog with filters and sorting — CLAUDE.md §5.1. */
export function ShopPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<SortOption>('newest')

  const visible = useMemo(
    () => soldOutLast(applySort(applyFilters(allProducts, filters), sort)),
    [filters, sort],
  )

  const emptyMessage = explainEmpty(allProducts, filters)

  return (
    <>
      <Seo
        title="Shop"
        description="Knitwear, shirts and trousers with real fit and fabric detail on every piece."
      />

      <div className="container-page py-14 md:py-20">
        <p className="eyebrow text-clay">All products</p>
        <h1 className="text-display mt-4">The collection</h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed">
          Every piece lists its fabric, its fit and what size is genuinely in stock. Filter by what
          matters to you, or let the Style Assistant narrow it down.
        </p>

        <div className="mt-12">
          <ShopFilters
            filters={filters}
            onChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            resultCount={visible.length}
          />

          <ProductGrid
            products={visible}
            emptyMessage={emptyMessage}
            onResetFilters={() => setFilters(EMPTY_FILTERS)}
          />
        </div>
      </div>
    </>
  )
}
