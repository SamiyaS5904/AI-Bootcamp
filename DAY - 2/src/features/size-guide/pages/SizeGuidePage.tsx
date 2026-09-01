import { useState } from 'react'
import { categories } from '@/data/catalog'
import { measurementKeys, measurementLabel, sizeChartForCategory } from '@/data/sizeChart'
import { SizeFinderQuiz } from '@/features/size-finder/components/SizeFinderQuiz'
import { Seo } from '@/components/common/Seo'
import { cn } from '@/lib/utils'

/** Size guide + Size Finder — CLAUDE.md §5.7, §5.10. */
export function SizeGuidePage() {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? 'knitwear')
  const rows = sizeChartForCategory(activeSlug)
  const keys = measurementKeys(activeSlug)

  return (
    <>
      <Seo
        title="Size guide"
        description="Saints Crew measurements by category, plus a Size Finder that maps your measurement onto our size chart."
      />

      <div className="container-page py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow text-clay">Sizing</p>
          <h1 className="text-display mt-4">Size guide</h1>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            Every figure below is the body measurement, in inches, that the size is cut for — the
            garment's own room is already built into the pattern. If you are between two sizes, the
            Size Finder tells you which way to go based on how you like things to fit.
          </p>
        </div>

        {/* Category tabs */}
        <div className="border-border mt-12 flex gap-1 border-b" role="tablist">
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              role="tab"
              aria-selected={activeSlug === category.slug}
              onClick={() => setActiveSlug(category.slug)}
              className={cn(
                'eyebrow -mb-px border-b-2 px-4 py-3 transition-colors',
                activeSlug === category.slug
                  ? 'border-clay text-clay'
                  : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Wide tables scroll inside their own container rather than the page. */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-md border-collapse text-sm">
            <thead>
              <tr className="border-border border-b">
                <th scope="col" className="eyebrow text-muted-foreground py-3 pr-4 text-left">
                  Size
                </th>
                {keys.map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="eyebrow text-muted-foreground py-3 pr-4 text-left"
                  >
                    {measurementLabel(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-border border-b last:border-0">
                  <th scope="row" className="py-4 pr-4 text-left font-medium">
                    {row.size_label}
                  </th>
                  {keys.map((key) => (
                    <td key={key} className="text-muted-foreground py-4 pr-4">
                      {row.measurements[key] ?? '—'}
                      <span className="text-xs">&quot;</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-16 max-w-2xl">
          <SizeFinderQuiz />
        </div>
      </div>
    </>
  )
}
