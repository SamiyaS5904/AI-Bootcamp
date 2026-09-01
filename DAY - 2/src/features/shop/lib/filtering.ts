import { isSoldOut } from '@/data/catalog'
import type { Product } from '@/types/models'

/**
 * Shop filtering and sorting — CLAUDE.md §5.1.
 *
 * Kept out of the components so `/shop` and `/shop/:category` share exactly one
 * implementation, and so the empty-state message can explain which filter
 * emptied the grid rather than showing a blank grid.
 */

export type SortOption = 'newest' | 'price-asc' | 'price-desc'

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

export type Filters = {
  /** Empty = all categories. Ignored on a category route, which pins one. */
  categories: string[]
  sizes: string[]
  colors: string[]
  /** Whole rupees. null = unbounded. */
  maxPrice: number | null
}

export const EMPTY_FILTERS: Filters = {
  categories: [],
  sizes: [],
  colors: [],
  maxPrice: null,
}

export function hasActiveFilters(filters: Filters) {
  return (
    filters.categories.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.maxPrice !== null
  )
}

export function applyFilters(all: Product[], filters: Filters): Product[] {
  return all.filter((product) => {
    if (filters.categories.length > 0 && !filters.categories.includes(product.category.slug)) {
      return false
    }

    if (filters.maxPrice !== null && product.price > filters.maxPrice) return false

    // Size and colour match against variants that are actually in stock —
    // filtering to a size that exists but is sold out would be misleading.
    if (filters.sizes.length > 0) {
      const available = product.variants.some(
        (variant) => variant.stock_qty > 0 && filters.sizes.includes(variant.size),
      )
      if (!available) return false
    }

    if (filters.colors.length > 0) {
      const available = product.variants.some(
        (variant) => variant.stock_qty > 0 && filters.colors.includes(variant.color),
      )
      if (!available) return false
    }

    return true
  })
}

export function applySort(list: Product[], sort: SortOption): Product[] {
  const sorted = [...list]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name))
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name))
    case 'newest':
      return sorted.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }
}

/**
 * Sold-out pieces sort last regardless of the chosen order — they're still
 * browsable, but they shouldn't lead the grid.
 */
export function soldOutLast(list: Product[]): Product[] {
  return [...list].sort((a, b) => Number(isSoldOut(a)) - Number(isSoldOut(b)))
}

/**
 * Which single filter is responsible for an empty grid, so §5.1's empty state
 * can say something specific. Returns null when the grid isn't empty.
 */
export function explainEmpty(all: Product[], filters: Filters): string | null {
  if (applyFilters(all, filters).length > 0) return null

  const probe = (override: Partial<Filters>) =>
    applyFilters(all, { ...filters, ...override }).length > 0

  if (filters.sizes.length > 0 && probe({ sizes: [] })) {
    return `Nothing is in stock in ${filters.sizes.join(' or ')} with your other filters.`
  }
  if (filters.maxPrice !== null && probe({ maxPrice: null })) {
    return 'Nothing falls under that price with your other filters.'
  }
  if (filters.colors.length > 0 && probe({ colors: [] })) {
    return `Nothing is in stock in ${filters.colors.join(' or ')} with your other filters.`
  }
  if (filters.categories.length > 0 && probe({ categories: [] })) {
    return 'Nothing in those categories matches your other filters.'
  }
  return 'No piece matches every filter you have set.'
}
