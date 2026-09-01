import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { routes } from '@/config/routes'
import { cn } from '@/lib/utils'
import type { ProductVariant } from '@/types/models'

/**
 * Stock-aware size selector — CLAUDE.md §5.2.
 *
 * Out-of-stock sizes are genuinely `disabled`, not merely greyed: §5.2 is
 * explicit that someone must not be able to select something unavailable. The
 * Size Guide link sits inside this block, where the doubt actually occurs.
 */
export function SizeSelector({
  variants,
  selectedId,
  onSelect,
  /** Set when the customer arrived from the Style Assistant with a known size. */
  suggestedSize,
}: {
  variants: ProductVariant[]
  selectedId: string | null
  onSelect: (variantId: string) => void
  suggestedSize?: string | null
}) {
  const allSoldOut = variants.every((variant) => variant.stock_qty <= 0)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="eyebrow text-muted-foreground">Size</span>
        <Link
          to={routes.sizeGuide}
          className="text-clay inline-flex items-center gap-1.5 text-xs hover:underline"
        >
          Not sure of your size?
          <ArrowRight className="size-3" strokeWidth={1.5} aria-hidden />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {variants.map((variant) => {
          const soldOut = variant.stock_qty <= 0
          const selected = variant.id === selectedId
          const suggested = suggestedSize === variant.size && !soldOut

          return (
            <button
              key={variant.id}
              type="button"
              disabled={soldOut}
              onClick={() => onSelect(variant.id)}
              aria-pressed={selected}
              title={soldOut ? `${variant.size} is out of stock` : undefined}
              className={cn(
                'relative min-w-14 rounded-sm border px-4 py-2.5 text-sm transition-colors',
                selected && 'border-clay bg-clay text-bone',
                !selected && !soldOut && 'border-border hover:border-stone',
                soldOut &&
                  'border-border text-muted-foreground cursor-not-allowed line-through opacity-50',
              )}
            >
              {variant.size}
              {suggested && !selected && (
                <span
                  className="bg-clay absolute -top-1 -right-1 size-2 rounded-full"
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>

      {allSoldOut && (
        <p className="text-brick mt-4 text-sm">
          Every size is currently sold out. {/* TODO: wire a back-in-stock notify signup. */}
        </p>
      )}

      {suggestedSize && !allSoldOut && (
        <p className="text-muted-foreground mt-4 text-xs">
          The Style Assistant suggested <span className="text-clay">{suggestedSize}</span> for you.
        </p>
      )}

      {/* Low-stock signal, only where it's genuinely low — not a fake urgency badge. */}
      {selectedId &&
        (() => {
          const selected = variants.find((variant) => variant.id === selectedId)
          if (!selected || selected.stock_qty > 3 || selected.stock_qty <= 0) return null
          return (
            <p className="text-muted-foreground mt-4 text-xs">
              Only {selected.stock_qty} left in {selected.size}.
            </p>
          )
        })()}
    </div>
  )
}
