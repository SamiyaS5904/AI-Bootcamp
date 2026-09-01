import { allColors, allSizes, categories, priceBounds } from '@/data/catalog'
import {
  SORT_OPTIONS,
  hasActiveFilters,
  type Filters,
  type SortOption,
} from '@/features/shop/lib/filtering'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'

/**
 * Filter and sort controls — CLAUDE.md §5.1.
 *
 * `lockedCategory` is set on `/shop/:category`, where the category is part of
 * the URL and must not be filterable away.
 */
export function ShopFilters({
  filters,
  onChange,
  sort,
  onSortChange,
  lockedCategory,
  resultCount,
}: {
  filters: Filters
  onChange: (next: Filters) => void
  sort: SortOption
  onSortChange: (next: SortOption) => void
  lockedCategory?: string
  resultCount: number
}) {
  const bounds = priceBounds()

  const toggle = (key: 'categories' | 'sizes' | 'colors', value: string) => {
    const current = filters[key]
    onChange({
      ...filters,
      [key]: current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    })
  }

  // Price bands derived from the catalog's actual range, rounded to something
  // readable, so the options stay sensible as the catalog grows.
  const priceBands = [2500, 3500, 5000].filter((band) => band < bounds.max)

  return (
    <div className="border-border border-b pb-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-6">
          {!lockedCategory && (
            <FilterRow label="Category">
              {categories.map((category) => (
                <Chip
                  key={category.slug}
                  active={filters.categories.includes(category.slug)}
                  onClick={() => toggle('categories', category.slug)}
                >
                  {category.name}
                </Chip>
              ))}
            </FilterRow>
          )}

          <FilterRow label="Size">
            {allSizes().map((size) => (
              <Chip
                key={size}
                active={filters.sizes.includes(size)}
                onClick={() => toggle('sizes', size)}
              >
                {size}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="Colour">
            {allColors().map((color) => (
              <Chip
                key={color}
                active={filters.colors.includes(color)}
                onClick={() => toggle('colors', color)}
              >
                {color}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="Price">
            {priceBands.map((band) => (
              <Chip
                key={band}
                active={filters.maxPrice === band}
                onClick={() =>
                  onChange({ ...filters, maxPrice: filters.maxPrice === band ? null : band })
                }
              >
                Under {formatPrice(band)}
              </Chip>
            ))}
          </FilterRow>
        </div>

        <div className="flex items-center gap-4">
          <label className="eyebrow text-muted-foreground" htmlFor="shop-sort">
            Sort
          </label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="border-input focus-visible:border-primary h-10 rounded-md border bg-transparent px-3 text-sm transition-colors focus-visible:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <p className="text-muted-foreground text-xs">
          {resultCount} {resultCount === 1 ? 'piece' : 'pieces'}
        </p>
        {hasActiveFilters(filters) && (
          <Button
            variant="link"
            className="text-muted-foreground text-xs"
            onClick={() =>
              onChange({
                categories: lockedCategory ? filters.categories : [],
                sizes: [],
                colors: [],
                maxPrice: null,
              })
            }
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="eyebrow text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-sm border px-3 py-1.5 text-xs transition-colors',
        active
          ? 'border-clay bg-clay text-bone'
          : 'border-border text-foreground hover:border-stone',
      )}
    >
      {children}
    </button>
  )
}
