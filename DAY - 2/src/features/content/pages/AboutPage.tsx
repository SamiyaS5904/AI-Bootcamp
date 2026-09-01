import { Link } from 'react-router-dom'
import { aboutImage } from '@/data/editorial'
import { Seo } from '@/components/common/Seo'
import { TodoMarker } from '@/components/common/TodoMarker'
import { Button } from '@/components/ui/button'
import { routes } from '@/config/routes'

/**
 * About — CLAUDE.md §5.10.
 *
 * The layout is finished; the brand story is not, and deliberately so. The old
 * site shipped a Zyro template's founding story ("two guys who loved hats"),
 * which is exactly the §8 failure this project exists to avoid. Rather than
 * invent a replacement that reads as real, each paragraph names the fact it
 * needs and shows a visible TODO.
 *
 * What IS written here is true: it describes how the store works, which is a
 * property of what was built rather than a claim about the brand's history.
 */
export function AboutPage() {
  return (
    <>
      <Seo
        title="About"
        description="Who Saints Crew is and why the clothes are made the way they are."
      />

      <div className="container-page py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-20">
          <div className="max-w-xl">
            <p className="eyebrow text-clay">About</p>
            <h1 className="text-display mt-4">Made to be understood</h1>

            <p className="mt-6 text-base leading-relaxed">
              Most menswear sites give you a photograph and a size chart nobody trusts. You guess,
              you order, and you find out whether it fits when the parcel arrives. That guessing is
              why people default to marketplaces instead of buying from a small label.
            </p>
            <p className="text-muted-foreground mt-5 text-base leading-relaxed">
              So this store is built the other way round. Every product page states its fabric, its
              cut and the sizes actually in stock. The Size Finder maps your own measurement onto
              our chart and shows you the arithmetic. The Style Assistant asks five questions and
              names specific pieces, with a reason for each. Nothing is hidden behind a tab.
            </p>

            <div className="border-border mt-12 space-y-8 border-t pt-10">
              <Fact label="Who we are">
                <TodoMarker topic="founding story — who started Saints Crew, when, and why" />
              </Fact>
              <Fact label="Where the fabric comes from">
                <TodoMarker topic="fabric sourcing — mills, yarn, which cities" />
              </Fact>
              <Fact label="How we decide fit">
                <TodoMarker topic="fit philosophy — how sizing and grading decisions get made" />
              </Fact>
              <Fact label="Where it's made">
                <TodoMarker topic="manufacturing — where garments are cut and sewn" />
              </Fact>
            </div>

            <div className="border-border bg-muted/40 mt-12 rounded-md border px-5 py-4">
              <p className="eyebrow text-muted-foreground">Story pending</p>
              <p className="mt-2.5 text-sm leading-relaxed">
                These four facts are yours to supply — they cannot be written for you. The previous
                site filled this page with a template&apos;s story about two men and a hat, which is
                the single thing worth not repeating.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild>
                <Link to={routes.shop}>See the collection</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={routes.contact}>Talk to us</Link>
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <img
              src={aboutImage.url}
              alt={aboutImage.alt}
              loading="lazy"
              className="bg-bone-sunk aspect-4/5 w-full rounded-md object-cover"
            />
          </div>
        </div>
      </div>
    </>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:gap-6">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}
