import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types/models'

/**
 * PDP image gallery — CLAUDE.md §5.2.
 *
 * Desktop: thumbnail strip beside the main image. Mobile: a horizontal
 * scroll-snap track, which gives native swiping with no gesture library.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[]
  productName: string
}) {
  const ordered = [...images].sort((a, b) => a.position - b.position)
  const [activeIndex, setActiveIndex] = useState(0)
  const active = ordered[activeIndex] ?? ordered[0]

  if (!active) {
    return (
      <div className="bg-bone-sunk text-muted-foreground flex aspect-4/5 items-center justify-center rounded-md text-sm">
        No images yet
      </div>
    )
  }

  return (
    // min-w-0 matters: this sits in a grid, and a grid item defaults to
    // `min-width: auto`, which lets the swipe track below grow to its content
    // width instead of scrolling inside itself — putting a sideways scrollbar
    // on the whole page.
    <div className="min-w-0">
      {/* Mobile: swipeable track */}
      <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:hidden">
        {ordered.map((image) => (
          <img
            key={image.id}
            src={image.url}
            alt={image.alt_text}
            loading={image.position === 0 ? 'eager' : 'lazy'}
            className="bg-bone-sunk aspect-4/5 w-[85vw] shrink-0 snap-center rounded-md object-cover"
          />
        ))}
      </div>

      {/* Desktop: main image + thumbnails */}
      <div className="hidden gap-4 md:flex">
        <div className="flex shrink-0 flex-col gap-3">
          {ordered.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View ${image.alt_text}`}
              aria-current={index === activeIndex}
              className={cn(
                'bg-bone-sunk aspect-4/5 w-20 overflow-hidden rounded-sm border-2 transition-colors',
                index === activeIndex ? 'border-clay' : 'hover:border-stone border-transparent',
              )}
            >
              <img src={image.url} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>

        <div className="bg-bone-sunk min-w-0 flex-1 overflow-hidden rounded-md">
          {/* key forces a fresh element per shot, so the fade replays on switch. */}
          <img
            key={active.id}
            src={active.url}
            alt={active.alt_text}
            className="animate-in fade-in size-full object-cover duration-200"
          />
        </div>
      </div>

      {ordered.length > 1 && (
        <p className="text-muted-foreground mt-3 text-xs md:hidden">
          Swipe for more views of {productName}
        </p>
      )}
    </div>
  )
}
