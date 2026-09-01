import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { products } from '@/data/catalog'
import type { Product } from '@/types/models'

/**
 * Wishlist state — CLAUDE.md §5.8.
 *
 * PHASE 1: localStorage, so the feature is usable without auth. §5.8 scopes the
 * real thing to logged-in customers via `wishlist_items`; when Supabase Auth
 * lands, this file becomes the sync layer and consumers stay unchanged.
 *
 * Stores product IDs only. Stock and size availability are read live from the
 * catalog at render time — §5.8 is explicit that a saved item must not be a
 * static snapshot.
 */

const STORAGE_KEY = 'saintscrew.wishlist.v1'

type WishlistContextValue = {
  items: Product[]
  ids: Set<string>
  has: (productId: string) => boolean
  toggle: (productId: string) => void
  remove: (productId: string) => void
  count: number
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useState<string[]>(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch {
      // Non-fatal; the wishlist still works for this session.
    }
  }, [stored])

  // Resolved against the live catalog, so a delisted product simply disappears.
  const items = useMemo(
    () => stored.flatMap((id) => products.filter((product) => product.id === id)),
    [stored],
  )

  const ids = useMemo(() => new Set(stored), [stored])

  const toggle = useCallback((productId: string) => {
    setStored((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    )
  }, [])

  const remove = useCallback((productId: string) => {
    setStored((current) => current.filter((id) => id !== productId))
  }, [])

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      ids,
      has: (productId: string) => ids.has(productId),
      toggle,
      remove,
      count: items.length,
    }),
    [items, ids, toggle, remove],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used inside <WishlistProvider>')
  return context
}
