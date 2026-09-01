import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { discountPercent, inStockSizes, isSoldOut } from '@/data/catalog'
import { useWishlist } from '@/features/wishlist/WishlistContext'
import { routes } from '@/config/routes'
import { cn, formatPrice } from '@/lib/utils'
import type { Product } from '@/types/models'

/**
 * Product card — CLAUDE.md §5.1.
 *
 * Image-forward, minimal text: name, price, category tag. Sizes are shown at a
 * glance, or a "Sold out" state replaces them.
 *
 * The only badge is the sale percentage, and only when there is a genuine
 * markdown (§3: "No cluttered badges/ribbons unless it's a genuine sale").
 *
 * Hover-to-second-image is wired but currently inert: only one photograph
 * exists per product. It activates as soon as a second shot is added.
 */
export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const [hovered, setHovered] = useState(false)
  const wishlist = useWishlist()

  const primary = product.images.find((image) => image.position === 0)
  const secondary = product.images.find((image) => image.position === 1)
  const shown = hovered && secondary ? secondary : primary

  const soldOut = isSoldOut(product)
  const sizes = inStockSizes(product)
  const saved = wishlist.has(product.id)
  const discount = discountPercent(product)

  return (
    <div className={cn('group relative', className)}>
      <Link
        to={routes.product(product.slug)}
        className="block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="bg-bone-sunk relative aspect-4/5 overflow-hidden rounded-md">
          {shown && (
            <img
              src={shown.url}
              alt={shown.alt_text}
              loading="lazy"
              className={cn(
                'size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]',
                soldOut && 'opacity-60',
              )}
            />
          )}

          {soldOut ? (
            <span className="bg-ink/85 text-bone eyebrow absolute top-3 left-3 rounded-sm px-2.5 py-1.5">
              Sold out
            </span>
          ) : (
            discount !== null && (
              <span className="bg-clay text-bone eyebrow absolute top-3 left-3 rounded-sm px-2.5 py-1.5">
                {discount}% off
              </span>
            )
          )}
        </div>

        <div className="mt-4">
          <p className="eyebrow text-muted-foreground">{product.category.name}</p>
          <h3 className="group-hover:text-clay mt-2 font-sans text-sm leading-snug font-medium transition-colors">
            {product.name}
          </h3>

          <p className="mt-1.5 flex items-baseline gap-2 text-sm">
            <span className="text-clay">{formatPrice(product.price)}</span>
            {product.compare_at_price !== null && product.compare_at_price > product.price && (
              <span className="text-muted-foreground text-xs line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </p>

          <p className="text-muted-foreground mt-2 text-xs">
            {soldOut ? 'Back in stock soon' : sizes.join(' · ')}
          </p>
        </div>
      </Link>

      {/* Wishlist toggle sits outside the Link so it doesn't navigate. */}
      <button
        type="button"
        onClick={() => wishlist.toggle(product.id)}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
        aria-pressed={saved}
        className="bg-background/85 hover:text-clay absolute top-3 right-3 rounded-sm p-2 backdrop-blur-sm transition-colors"
      >
        <Heart
          className={cn(
            'size-4 transition-transform duration-200',
            saved ? 'fill-clay text-clay scale-110' : 'scale-100',
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>
    </div>
  )
}
