import { Link } from 'react-router-dom'
import { categories, isSoldOut, products } from '@/data/catalog'
import { categoryCovers, editorialBreak, hero, philosophyImage } from '@/data/editorial'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { NewsletterForm } from '@/features/newsletter/components/NewsletterForm'
import { Seo } from '@/components/common/Seo'
import { Reveal } from '@/components/common/Reveal'
import { Button } from '@/components/ui/button'
import { routes } from '@/config/routes'
import { formatPrice } from '@/lib/utils'

/**
 * Homepage — CLAUDE.md §4, §5.11.
 *
 * Composed as an editorial sequence rather than a stack of card grids:
 *
 *   hero → brand statement → featured piece → category → editorial break
 *        → philosophy → selected products → newsletter
 *
 * Motion is one-time only. A marquee, a Ken Burns hero drift and a bouncing
 * scroll cue were all tried and removed — continuous movement made the page
 * feel restless and competed with the clothes. What remains is a masked
 * headline on load and a single fade-up per section on first scroll.
 *
 * The style assistant is deliberately understated here: a text link, not a
 * campaign. It is a service, not the brand.
 */
export function HomePage() {
  const inStock = products.filter((product) => !isSoldOut(product))
  const featured = inStock[0]
  const selected = [...inStock].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 3)

  return (
    <>
      <Seo title="Considered menswear" />

      {/* ═══════════════════════════════════════════════════════════ HERO
          One still photograph, art-directed per breakpoint. Minimal copy,
          bottom-aligned, single primary action. */}
      <section className="dark bg-ink text-bone relative isolate flex min-h-[88svh] flex-col justify-end overflow-hidden">
        <picture>
          <source media="(min-width: 768px)" srcSet={hero.landscape} />
          <img
            src={hero.portrait}
            alt={hero.alt}
            fetchPriority="high"
            className="absolute inset-0 -z-20 size-full object-cover object-center"
          />
        </picture>

        {/* Single soft scrim, weighted to the bottom where the type sits. */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(to top, color-mix(in oklab, var(--color-ink) 88%, transparent) 0%, color-mix(in oklab, var(--color-ink) 45%, transparent) 42%, color-mix(in oklab, var(--color-ink) 10%, transparent) 100%)',
          }}
          aria-hidden
        />

        <div className="container-page relative pt-48 pb-16 md:pb-24">
          <h1 className="font-display max-w-4xl text-[clamp(2.5rem,7.5vw,6rem)] leading-[0.94] tracking-[-0.035em]">
            <span className="line-mask">
              <span className="line-rise block" style={{ animationDelay: '120ms' }}>
                Considered
              </span>
            </span>
            <span className="line-mask">
              <span className="line-rise block" style={{ animationDelay: '240ms' }}>
                menswear.
              </span>
            </span>
          </h1>

          <div
            className="rise-in mt-10 flex flex-col gap-6 sm:flex-row sm:items-center"
            style={{ animationDelay: '560ms' }}
          >
            <Button asChild size="lg">
              <Link to={routes.shop}>Shop the collection</Link>
            </Button>
            <Link
              to={routes.styleAssistant}
              className="text-bone/70 hover:text-bone text-sm underline-offset-4 transition-colors hover:underline"
            >
              Need help finding your fit?
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ BRAND STATEMENT
          Type doing the work. Nothing here but words and air. */}
      <section className="container-page py-32 md:py-48">
        <Reveal>
          <p className="font-display max-w-4xl text-[clamp(1.5rem,3.4vw,2.75rem)] leading-[1.28] tracking-[-0.015em] text-balance">
            We tell you the fabric, the cut, and what is actually left in your size —
            <span className="text-muted-foreground"> before you spend anything.</span>
          </p>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════ FEATURED PIECE
          Asymmetric: a tall image against a narrow column of type. */}
      {featured && (
        <section className="container-page pb-32 md:pb-48">
          <Reveal>
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <Link
                to={routes.product(featured.slug)}
                className="group focus-visible:ring-ring block focus-visible:ring-2 focus-visible:ring-offset-4 md:col-span-7"
              >
                <div className="bg-bone-sunk aspect-4/5 overflow-hidden md:aspect-3/4">
                  <img
                    src={featured.images[0]?.url}
                    alt={featured.images[0]?.alt_text ?? featured.name}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </Link>

              <div className="flex flex-col justify-end md:col-span-4 md:col-start-9 md:pb-6">
                <p className="eyebrow text-muted-foreground">Featured</p>
                <h2 className="font-display mt-5 text-3xl leading-tight md:text-4xl">
                  {featured.name}
                </h2>
                <p className="text-muted-foreground mt-5 text-sm leading-relaxed">
                  {featured.category.name} · {featured.fit_type} fit
                </p>
                <p className="mt-6 text-base">{formatPrice(featured.price)}</p>
                <Link
                  to={routes.product(featured.slug)}
                  className="eyebrow text-clay mt-8 self-start border-b border-current pb-1 transition-opacity hover:opacity-70"
                >
                  View piece
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ═════════════════════════════════════════════════════ CATEGORY */}
      <section className="container-page pb-32 md:pb-48">
        <Reveal>
          <p className="eyebrow text-muted-foreground">The collection</p>
        </Reveal>

        <div className="mt-12 grid gap-x-6 gap-y-14 md:mt-16 md:grid-cols-3">
          {categories.map((category, index) => {
            const cover = categoryCovers[category.slug]
            const inCategory = products.filter((p) => p.category.slug === category.slug)
            const from = Math.min(...inCategory.map((p) => p.price))

            return (
              <Reveal key={category.slug} delay={index * 80}>
                <Link
                  to={routes.shopCategory(category.slug)}
                  className="group focus-visible:ring-ring block focus-visible:ring-2 focus-visible:ring-offset-4"
                >
                  <div className="bg-bone-sunk aspect-3/4 overflow-hidden">
                    {cover && (
                      <img
                        src={cover.url}
                        alt={cover.alt}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]"
                      />
                    )}
                  </div>
                  <div className="mt-6 flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-xl md:text-2xl">{category.name}</h3>
                    <p className="text-muted-foreground text-xs">From {formatPrice(from)}</p>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ EDITORIAL BREAK
          Full-bleed image. A pause in the page — no cards, no grid. */}
      <section className="relative">
        <div className="bg-bone-sunk h-[62svh] overflow-hidden md:h-[78svh]">
          <img
            src={editorialBreak.url}
            alt={editorialBreak.alt}
            loading="lazy"
            className="size-full object-cover object-center"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ PHILOSOPHY */}
      <section className="container-page py-32 md:py-48">
        <div className="grid gap-14 md:grid-cols-12 md:gap-16">
          <Reveal className="md:col-span-5">
            <div className="bg-bone-sunk aspect-4/5 overflow-hidden">
              <img
                src={philosophyImage.url}
                alt={philosophyImage.alt}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={80} className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <p className="eyebrow text-muted-foreground">Our approach</p>
            <h2 className="font-display mt-6 text-3xl leading-tight md:text-4xl">
              Fewer things, cut properly
            </h2>
            <p className="text-muted-foreground mt-8 max-w-md text-base leading-relaxed">
              Knitwear, shirts and trousers. That is the whole range, and it stays that way on
              purpose — a short line we can get right beats a long one we cannot.
            </p>
            <p className="text-muted-foreground mt-5 max-w-md text-base leading-relaxed">
              Every product page carries its fabric, its cut and the sizes genuinely in stock. If
              you are between two, our fit guide maps your own measurement onto the chart and shows
              you the arithmetic.
            </p>
            <Link
              to={routes.about}
              className="eyebrow text-clay mt-10 self-start border-b border-current pb-1 transition-opacity hover:opacity-70"
            >
              More about us
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═════════════════════════════════════════════ SELECTED PRODUCTS */}
      <section className="container-page pb-32 md:pb-48">
        <Reveal>
          <div className="flex items-baseline justify-between gap-6">
            <p className="eyebrow text-muted-foreground">Recently added</p>
            <Link
              to={routes.shop}
              className="eyebrow text-clay border-b border-current pb-1 transition-opacity hover:opacity-70"
            >
              All products
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-16 md:mt-16 md:grid-cols-3 md:gap-x-8">
          {selected.map((product, index) => (
            <Reveal key={product.id} delay={index * 80}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════ NEWSLETTER */}
      <section className="dark bg-ink text-bone">
        <div className="container-page py-28 md:py-36">
          <div className="mx-auto max-w-md text-center">
            <h2 className="font-display text-2xl md:text-3xl">First access to new pieces</h2>
            <div className="mt-10 flex justify-center">
              <NewsletterForm align="center" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
