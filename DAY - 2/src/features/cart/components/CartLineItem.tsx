import { Link } from 'react-router-dom'
import { Minus, Plus, X } from 'lucide-react'
import { useCart } from '@/features/cart/CartContext'
import { lineSubtotal } from '@/features/cart/lib/pricing'
import { routes } from '@/config/routes'
import { formatPrice } from '@/lib/utils'
import type { CartLine } from '@/types/models'

/** A single bag line: quantity adjustment and remove — CLAUDE.md §5.3. */
export function CartLineItem({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const cart = useCart()
  const { product } = line.variant
  const outOfStock = line.variant.stock_qty <= 0
  const overStock = !outOfStock && line.qty > line.variant.stock_qty

  return (
    <li className="flex gap-4 py-6">
      <Link
        to={routes.product(product.slug)}
        className="bg-bone-sunk block shrink-0 overflow-hidden rounded-sm"
      >
        {product.image && (
          <img
            src={product.image.url}
            alt={product.image.alt_text}
            className={compact ? 'aspect-4/5 w-16 object-cover' : 'aspect-4/5 w-20 object-cover'}
          />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={routes.product(product.slug)}
              className="hover:text-clay block text-sm leading-snug font-medium transition-colors"
            >
              {product.name}
            </Link>
            <p className="text-muted-foreground mt-1 text-xs">
              {line.variant.size} · {line.variant.color}
            </p>
          </div>

          <button
            type="button"
            onClick={() => cart.remove(line.id)}
            aria-label={`Remove ${product.name} from bag`}
            className="text-muted-foreground hover:text-brick -mt-1 p-1 transition-colors"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Stock is re-checked on render, so a bag left open overnight tells the
            truth rather than failing at checkout. */}
        {outOfStock && (
          <p className="text-brick mt-2 text-xs">This size sold out while it was in your bag.</p>
        )}
        {overStock && (
          <p className="text-brick mt-2 text-xs">
            Only {line.variant.stock_qty} left — reduce the quantity to continue.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="border-border flex items-center rounded-sm border">
            <button
              type="button"
              onClick={() => cart.setQty(line.id, line.qty - 1)}
              aria-label="Decrease quantity"
              className="hover:text-clay px-2.5 py-1.5 transition-colors"
            >
              <Minus className="size-3.5" strokeWidth={1.5} />
            </button>
            <span className="min-w-8 text-center text-sm" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => cart.setQty(line.id, line.qty + 1)}
              disabled={line.qty >= line.variant.stock_qty}
              aria-label="Increase quantity"
              className="hover:text-clay px-2.5 py-1.5 transition-colors disabled:opacity-40"
            >
              <Plus className="size-3.5" strokeWidth={1.5} />
            </button>
          </div>

          <p className="text-sm">{formatPrice(lineSubtotal(line))}</p>
        </div>
      </div>
    </li>
  )
}
