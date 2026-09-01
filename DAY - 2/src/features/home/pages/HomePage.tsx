import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react'
import { categories, isSoldOut, products } from '@/data/catalog'
import { aboutImage, categoryCovers } from '@/data/editorial'
import { HeroSlideshow } from '@/features/home/components/HeroSlideshow'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { NewsletterForm } from '@/features/newsletter/components/NewsletterForm'
import { Seo } from '@/components/common/Seo'
import { Reveal } from '@/components/common/Reveal'
import { Marquee } from '@/components/common/Marquee'
import { Button } from '@/components/ui/button'
import { routes } from '@/config/routes'
import { formatPrice } from '@/lib/utils'

/**
 * Homepage — CLAUDE.md §4, §5.11.
 *
 * The hero copy describes the store's actual proposition (§1: fit and fabric
 * guidance removing purchase hesitation) — a fact about what was built, not
 * invented brand history. The founding story stays a {{TODO}} on /about.
 *
 * Motion here is entrance and ambience only: nothing moves in response to the
 * cursor, and nothing bounces (§3). Every animation is opacity/transform and is
 * collapsed under prefers-reduced-motion.
 */
export function HomePage() {
  const newest = [...products]
    .filter((product) => !isSoldOut(product))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3)

  return (
    <>
      <Seo title="Considered menswear" />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="dark bg-ink text-bone relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden">
        <HeroSlideshow />
        {/* Two scrims, not one. The vertical pass grounds the bottom of the
            frame; the horizontal pass guarantees contrast behind the copy no
            matter how bright that side of the photograph happens to be. */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(to top, var(--color-ink) 0%, color-mix(in oklab, var(--color-ink) 72%, transparent) 38%, color-mix(in oklab, var(--color-ink) 28%, transparent) 100%)',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(to right, color-mix(in oklab, var(--color-ink) 70%, transparent) 0%, color-mix(in oklab, var(--color-ink) 30%, transparent) 45%, transparent 75%)',
          }}
          aria-hidden
        />

        <div className="container-page relative pt-40 pb-20 md:pb-28">
          <p className="eyebrow text-clay rise-in" style={{ animationDelay: '80ms' }}>
            Knitwear · Shirts · Trousers
          </p>

          {/* Masked line-by-line wipe. Each line is its own overflow-hidden box
              so the text rises from behind a hard edge. */}
          <h1 className="font-display mt-7 text-[clamp(2.75rem,9vw,7rem)] leading-[0.95] tracking-[-0.03em]">
            <span className="line-mask">
              <span className="line-rise" style={{ animationDelay: '160ms' }}>
                Know how it fits
              </span>
            </span>
            <span className="line-mask">
              <span className="line-rise text-stone" style={{ animationDelay: '300ms' }}>
                before it arrives.
              </span>
            </span>
          </h1>

          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p
              className="rise-in max-w-md text-base leading-relaxed text-balance"
              style={{ animationDelay: '480ms' }}
            >
              Every piece lists its fabric, its cut and the sizes genuinely in stock. Still unsure?
              Our Style Assistant points you straight at what suits you.
            </p>

            <div className="rise-in flex flex-wrap gap-3" style={{ animationDelay: '600ms' }}>
              <Button asChild size="lg">
                <Link to={routes.styleAssistant}>
                  <Sparkles className="mr-1 size-4" strokeWidth={1.5} />
                  Ask the Style Assistant
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={routes.shop}>Browse the collection</Link>
              </Button>
            </div>
          </div>

          <div
            className="rise-in text-stone mt-16 hidden items-center gap-3 md:flex"
            style={{ animationDelay: '760ms' }}
          >
            <ArrowDown className="size-3.5 animate-bounce" strokeWidth={1.5} aria-hidden />
            <span className="eyebrow">Scroll</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Marquee */}
      <div className="dark bg-ink text-bone border-border border-y">
        <Marquee
          items={[
            'Fabric stated',
            'Fit explained',
            'Real stock',
            'Made in India',
            'Free over ₹2,000',
          ]}
        />
      </div>

      {/* ------------------------------------------------------------ Category */}
      <section className="container-page py-24 md:py-32">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-clay">Shop by category</p>
            <h2 className="font-display mt-4 text-3xl md:text-5xl">Three things, done properly</h2>
          </div>
          <Link
            to={routes.shop}
            className="eyebrow text-clay hidden items-center gap-2 hover:underline md:inline-flex"
          >
            All products
            <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
          </Link>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3 md:gap-6">
          {categories.map((category, index) => {
            const cover = categoryCovers[category.slug]
            const inCategory = products.filter((p) => p.category.slug === category.slug)
            const from = Math.min(...inCategory.map((p) => p.price))

            return (
              <Reveal key={category.slug} delay={index * 110}>
                <Link
                  to={routes.shopCategory(category.slug)}
                  className="group focus-visible:ring-ring block rounded-md focus-visible:ring-2 focus-visible:ring-offset-4"
                >
                  <div className="bg-bone-sunk relative aspect-3/4 overflow-hidden rounded-md">
                    {cover && (
                      <img
                        src={cover.url}
                        alt={cover.alt}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                    )}
                    <div
                      className="from-ink/85 via-ink/15 absolute inset-0 bg-gradient-to-t to-transparent"
                      aria-hidden
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="text-bone/70 eyebrow">
                        {inCategory.length} {inCategory.length === 1 ? 'piece' : 'pieces'} · from{' '}
                        {formatPrice(from)}
                      </p>
                      <h3 className="text-bone font-display mt-2 flex items-center gap-2.5 text-2xl md:text-3xl">
                        {category.name}
                        <ArrowRight
                          className="size-5 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </h3>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ----------------------------------------------------- Big statement */}
      <section className="dark bg-ink text-bone">
        <div className="container-page py-28 md:py-40">
          <Reveal>
            <p className="eyebrow text-clay">Why we bother</p>
            <p className="font-display mt-10 max-w-5xl text-[clamp(1.75rem,4.6vw,3.75rem)] leading-[1.1] tracking-[-0.02em] text-balance">
              Most sites give you a photograph and a size chart nobody trusts.{' '}
              <span className="text-stone">
                We tell you the fabric, the cut, and exactly what is left in your size — before you
                spend anything.
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- New arrivals */}
      <section className="bg-bone-sunk">
        <div className="container-page py-24 md:py-32">
          <p className="eyebrow text-clay">New arrival</p>
          <h2 className="font-display mt-4 text-3xl md:text-5xl">Latest in</h2>

          <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8">
            {newest.map((product, index) => (
              <Reveal key={product.id} delay={index * 110}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to={routes.shop}>See everything</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Style Assistant */}
      <section className="container-page py-24 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative aspect-4/5 overflow-hidden rounded-md">
              <img
                src={aboutImage.url}
                alt={aboutImage.alt}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="text-clay size-4" strokeWidth={1.5} aria-hidden />
                <p className="eyebrow text-clay">Style Assistant</p>
              </div>

              <h2 className="font-display mt-6 text-3xl md:text-5xl">Not sure what you need?</h2>

              <p className="text-muted-foreground mt-6 max-w-md text-base leading-relaxed">
                Our assistant does the narrowing down for you. A few quick taps about the occasion,
                the fit you like and your size — and it comes back with specific pieces, each with a
                line on why it suits you. No endless scrolling, no guessing.
              </p>

              <Button asChild size="lg" className="mt-10">
                <Link to={routes.styleAssistant}>Find my pieces</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- Newsletter */}
      <section className="dark bg-ink text-bone">
        <div className="container-page py-24 md:py-28">
          <div className="mx-auto max-w-lg text-center">
            <p className="eyebrow text-clay">Newsletter</p>
            <h2 className="font-display mt-4 text-3xl md:text-5xl">Be early</h2>
            <div className="mt-8 flex justify-center">
              <NewsletterForm align="center" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
