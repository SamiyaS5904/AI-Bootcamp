import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { inStockSizes, isSoldOut } from '@/data/catalog'
import { useWishlist } from '@/features/wishlist/WishlistContext'
import { routes } from '@/config/routes'
import { cn, formatPrice } from '@/lib/utils'
import type { Product } from '@/types/models'

/**
 * Product card — CLAUDE.md §5.1.
 *
 * Art direction notes, since this is the most-repeated element on the site:
 *
 *  - 3:4 imagery, square corners, no card chrome. The photograph is the card;
 *    a border or shadow around it reads as a UI component rather than a
 *    garment.
 *  - Hover swaps to the second shot with a cross-fade and a 1.02 scale over
 *    900ms — slow enough to feel deliberate, small enough that the product
 *    never appears to jump.
 *  - The wishlist control only appears on hover or keyboard focus, so a grid at
 *    rest is nothing but clothes. It stays reachable by keyboard at all times.
 *  - Price is set in the body colour, not the accent. A grid of clay prices
 *    turns the page into a sale rail.
 *  - Sizes are shown at rest because knowing your size is stocked is the whole
 *    premise of the store (§1).
 */
export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const [hovered, setHovered] = useState(false)
  const wishlist = useWishlist()

  const primary = product.images.find((image) => image.position === 0)
  const secondary = product.images.find((image) => image.position === 1)

  const soldOut = isSoldOut(product)
  const sizes = inStockSizes(product)
  const saved = wishlist.has(product.id)

  return (
    <div
      className={cn('group relative', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={routes.product(product.slug)} className="block">
        <div className="bg-bone-sunk relative aspect-3/4 overflow-hidden">
          {/* Both frames are stacked and cross-faded, so the swap has no gap
              and no reflow. */}
          {primary && (
            <img
              src={primary.url}
              alt={primary.alt_text}
              loading="lazy"
              className={cn(
                'absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[900ms] ease-out',
                secondary && hovered ? 'opacity-0' : 'opacity-100',
                hovered && 'scale-[1.02]',
                soldOut && 'opacity-55',
              )}
            />
          )}
          {secondary && (
            <img
              src={secondary.url}
              alt=""
              loading="lazy"
              aria-hidden
              className={cn(
                'absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[900ms] ease-out',
                hovered ? 'scale-[1.02] opacity-100' : 'opacity-0',
                soldOut && 'opacity-0',
              )}
            />
          )}

          {/* Sold out is the only badge. A "68% OFF" flash on every card turns
              a considered rail into a clearance bin — the markdown is already
              legible from the struck-through price below, which is how a
              premium label states it. */}
          {soldOut && (
            <span className="text-bone bg-ink/80 eyebrow absolute top-4 left-4 px-2.5 py-1.5">
              Sold out
            </span>
          )}
        </div>

        <div className="mt-5">
          <h3 className="text-sm leading-snug font-medium">{product.name}</h3>

          <p className="mt-2 flex items-baseline gap-2.5 text-sm">
            <span>{formatPrice(product.price)}</span>
            {product.compare_at_price !== null && product.compare_at_price > product.price && (
              <span className="text-muted-foreground text-xs line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </p>

          <p className="text-muted-foreground mt-3 text-xs tracking-wide">
            {soldOut ? 'Back in stock soon' : sizes.join('  ·  ')}
          </p>
        </div>
      </Link>

      {/* Outside the Link so it never navigates. Hidden at rest, but always
          focusable — `opacity-0` keeps it in the tab order, `hidden` would not. */}
      <button
        type="button"
        onClick={() => wishlist.toggle(product.id)}
        aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
        aria-pressed={saved}
        className={cn(
          'absolute top-4 right-4 p-2 transition-opacity duration-300',
          'group-hover:opacity-100 focus-visible:opacity-100',
          saved ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Heart
          className={cn('size-4', saved ? 'fill-bone text-bone' : 'text-bone drop-shadow-sm')}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>
    </div>
  )
}
