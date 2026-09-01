import { Link } from 'react-router-dom'
import { inStockSizes, isSoldOut } from '@/data/catalog'
import { useWishlist } from '@/features/wishlist/WishlistContext'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/ui/button'
import { routes } from '@/config/routes'

/**
 * Wishlist — CLAUDE.md §5.8.
 *
 * Availability is read live from the catalog, not stored with the save, so a
 * saved item tells the truth about what is still gettable in which size.
 */
export function WishlistPage() {
  const wishlist = useWishlist()

  return (
    <>
      <Seo title="Wishlist" noIndex />

      <div className="container-page py-14 md:py-20">
        <p className="eyebrow text-clay">Saved</p>
        <h1 className="text-display mt-4">
          {wishlist.count === 0
            ? 'Nothing saved yet'
            : `${wishlist.count} ${wishlist.count === 1 ? 'piece' : 'pieces'} saved`}
        </h1>

        {wishlist.count === 0 ? (
          <div className="mt-12 max-w-lg">
            <p className="text-muted-foreground text-base leading-relaxed">
              Tap the heart on any piece to keep it here. We will show you whether it is still
              available in your size.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild>
                <Link to={routes.shop}>Browse the shop</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={routes.styleAssistant}>Ask the Style Assistant</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
            {wishlist.items.map((product) => {
              const soldOut = isSoldOut(product)
              const sizes = inStockSizes(product)

              return (
                <div key={product.id}>
                  <ProductCard product={product} />
                  <p
                    className={
                      soldOut
                        ? 'text-brick mt-3 border-l-2 border-current pl-3 text-xs leading-relaxed'
                        : 'text-muted-foreground border-moss mt-3 border-l-2 pl-3 text-xs leading-relaxed'
                    }
                  >
                    {soldOut
                      ? 'Every size sold out since you saved it.'
                      : `Still available in ${sizes.join(', ')}.`}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
