import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getVariantById } from '@/data/catalog'
import type { CartLine } from '@/types/models'

/**
 * Cart state — CLAUDE.md §5.3, using React Context per §2 (no Redux/Zustand).
 *
 * PHASE 1: persisted to localStorage. §5.3 wants this server-side against the
 * Supabase session (anonymous for guests); when that lands, only this file
 * changes — every consumer uses the hook below.
 *
 * Only variant IDs and quantities are stored. Prices and names are always
 * re-read from the catalog on load, so a stale cart can never show an old
 * price. That's the same reason `cart_items` has no price column.
 */

const STORAGE_KEY = 'saintscrew.cart.v1'

type StoredLine = { variantId: string; qty: number }

type CartContextValue = {
  lines: CartLine[]
  /** Adds a variant, or increases its quantity if already in the bag. */
  add: (variantId: string, qty?: number) => void
  setQty: (variantId: string, qty: number) => void
  remove: (variantId: string) => void
  clear: () => void
  /** Drawer visibility — §5.3 wants the cart openable from anywhere. */
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

/** Per-line quantity cap, mirroring the `cart_items.qty` check constraint. */
const MAX_QTY = 10

function readStored(): StoredLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is StoredLine =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as StoredLine).variantId === 'string' &&
        typeof (entry as StoredLine).qty === 'number',
    )
  } catch {
    // Private-window or blocked storage. An empty cart is the right fallback.
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useState<StoredLine[]>(readStored)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch {
      // Nothing useful to do — the cart still works for this session.
    }
  }, [stored])

  /**
   * Resolve stored IDs against the live catalog. A variant that no longer
   * exists is dropped rather than rendered as a broken line.
   */
  const lines = useMemo<CartLine[]>(() => {
    return stored.flatMap((entry) => {
      const found = getVariantById(entry.variantId)
      if (!found) return []
      const { product, variant } = found
      const primaryImage = product.images.find((image) => image.position === 0) ?? null

      return [
        {
          id: entry.variantId,
          qty: entry.qty,
          variant: {
            ...variant,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: primaryImage,
            },
          },
        },
      ]
    })
  }, [stored])

  const add = useCallback((variantId: string, qty = 1) => {
    setStored((current) => {
      const existing = current.find((entry) => entry.variantId === variantId)
      if (existing) {
        return current.map((entry) =>
          entry.variantId === variantId
            ? { ...entry, qty: Math.min(MAX_QTY, entry.qty + qty) }
            : entry,
        )
      }
      return [...current, { variantId, qty: Math.min(MAX_QTY, qty) }]
    })
    setDrawerOpen(true)
  }, [])

  const setQty = useCallback((variantId: string, qty: number) => {
    setStored((current) => {
      if (qty <= 0) return current.filter((entry) => entry.variantId !== variantId)
      return current.map((entry) =>
        entry.variantId === variantId ? { ...entry, qty: Math.min(MAX_QTY, qty) } : entry,
      )
    })
  }, [])

  const remove = useCallback((variantId: string) => {
    setStored((current) => current.filter((entry) => entry.variantId !== variantId))
  }, [])

  const clear = useCallback(() => setStored([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      add,
      setQty,
      remove,
      clear,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [lines, add, setQty, remove, clear, isDrawerOpen],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}
