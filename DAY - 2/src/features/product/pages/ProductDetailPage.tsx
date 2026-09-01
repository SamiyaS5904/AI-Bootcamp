import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Heart, Sparkles } from 'lucide-react'
import { discountPercent, getProductBySlug, isSoldOut, products } from '@/data/catalog'
import { ProductGallery } from '@/features/product/components/ProductGallery'
import { SizeSelector } from '@/features/product/components/SizeSelector'
import { FabricFitPanel } from '@/features/product/components/FabricFitPanel'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { useCart } from '@/features/cart/CartContext'
import { useWishlist } from '@/features/wishlist/WishlistContext'
import { NotFoundPage } from '@/features/errors/pages/NotFoundPage'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/ui/button'
import { routes } from '@/config/routes'
import { cn, formatPrice } from '@/lib/utils'
import type { Product } from '@/types/models'

/** Product detail page — CLAUDE.md §5.2. */
export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const product = slug ? getProductBySlug(slug) : undefined

  const cart = useCart()
  const wishlist = useWishlist()
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // The Style Assistant and Size Finder both link here with ?size=M so the
  // customer doesn't have to remember their own answer.
  const suggestedSize = searchParams.get('size')

  const related = useMemo(() => (product ? relatedProducts(product) : []), [product])

  if (!product || !slug) return <NotFoundPage />

  const soldOut = isSoldOut(product)
  const saved = wishlist.has(product.id)
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId)

  const handleAddToBag = () => {
    if (!selectedVariant) {
      setValidationError('Choose a size first.')
      return
    }
    setValidationError(null)
    cart.add(selectedVariant.id)
  }

  return (
    <>
      <Seo
        title={product.name}
        description={`${product.name} — ${fitLabel(product.fit_type)} fit. Fabric, fit and real stock detail from Saints Crew.`}
      />

      <div className="container-page py-10 md:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="eyebrow text-muted-foreground">
          <Link to={routes.shop} className="hover:text-clay transition-colors">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <Link
            to={routes.shopCategory(product.category.slug)}
            className="hover:text-clay transition-colors"
          >
            {product.category.name}
          </Link>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-clay">{product.category.name}</p>
            <h1 className="font-display mt-4 text-3xl leading-tight md:text-4xl">{product.name}</h1>
            <p className="mt-4 flex items-baseline gap-3">
              <span className="text-lg">{formatPrice(product.price)}</span>
              {product.compare_at_price !== null && product.compare_at_price > product.price && (
                <>
                  <span className="text-muted-foreground text-sm line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                  <span className="eyebrow text-clay">{discountPercent(product)}% off</span>
                </>
              )}
            </p>

            <div className="mt-6 text-sm leading-relaxed">
              {product.description.startsWith('{{TODO') ? (
                <span className="bg-brick/15 text-brick ring-brick/40 inline-block rounded-sm px-1.5 py-0.5 font-mono text-[0.6875rem] ring-1 ring-inset">
                  {product.description}
                </span>
              ) : (
                product.description
              )}
            </div>

            <div className="mt-10">
              <SizeSelector
                variants={product.variants}
                selectedId={selectedVariantId}
                onSelect={(id) => {
                  setSelectedVariantId(id)
                  setValidationError(null)
                }}
                suggestedSize={suggestedSize}
              />
            </div>

            {validationError && (
              <p className="text-brick mt-4 text-sm" role="alert">
                {validationError}
              </p>
            )}

            {/* Both actions reachable without scrolling on mobile (§5.2). */}
            <div className="mt-8 flex gap-3">
              <Button size="lg" className="flex-1" disabled={soldOut} onClick={handleAddToBag}>
                {soldOut ? 'Sold out' : 'Add to bag'}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => wishlist.toggle(product.id)}
                aria-pressed={saved}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={cn('size-4', saved && 'fill-clay text-clay')} strokeWidth={1.5} />
              </Button>
            </div>

            {/* Contextual Style Assistant entry point (§5.2). */}
            <Link
              to={routes.styleAssistant}
              className="border-border hover:border-clay mt-8 flex items-start gap-3 rounded-md border p-4 transition-colors"
            >
              <Sparkles
                className="text-clay mt-0.5 size-4 shrink-0"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="text-sm leading-relaxed">
                <span className="font-medium">Not sure this is right for you?</span>{' '}
                <span className="text-muted-foreground">
                  Answer five questions and the Style Assistant will tell you whether this suits
                  what you need.
                </span>
              </span>
            </Link>

            <div className="mt-12">
              <FabricFitPanel product={product} />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="border-border mt-24 border-t pt-16">
            <p className="eyebrow text-clay">Pairs with</p>
            <h2 className="font-display mt-4 text-2xl">Complete the look</h2>
            <p className="text-muted-foreground mt-3 max-w-lg text-sm leading-relaxed">
              {pairingRationale(product)}
            </p>

            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

/**
 * Related products — CLAUDE.md §5.2 requires real pairing logic based on
 * category/tag, not random selection.
 *
 * The rule: a top pairs with trousers, trousers pair with tops. Within the
 * pairing category, prefer a matching fit so the proportions work together, and
 * never suggest something sold out.
 */
function relatedProducts(product: Product): Product[] {
  const isBottom = product.category.slug === 'trousers'
  const pairWith = isBottom ? ['shirts', 'knitwear'] : ['trousers']

  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        pairWith.includes(candidate.category.slug) &&
        !isSoldOut(candidate),
    )
    .sort((a, b) => {
      // Same fit first, then cheaper first for a stable order.
      const aFit = a.fit_type === product.fit_type ? 0 : 1
      const bFit = b.fit_type === product.fit_type ? 0 : 1
      if (aFit !== bFit) return aFit - bFit
      return a.price - b.price
    })
    .slice(0, 3)
}

function pairingRationale(product: Product) {
  return product.category.slug === 'trousers'
    ? `Tops cut to work with a ${fitLabel(product.fit_type)} trouser line.`
    : `Trousers that balance a ${fitLabel(product.fit_type)} top.`
}

function fitLabel(fit: Product['fit_type']) {
  return fit
}
