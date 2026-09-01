import { useEffect, useState } from 'react'
import { heroSlides } from '@/data/editorial'
import { cn } from '@/lib/utils'

/** How long each frame holds before crossfading, in ms. */
const HOLD = 6000
/** Crossfade length. Slower than the UI's 200ms — this is ambience, not feedback. */
const FADE = 1400

/**
 * Crossfading photography behind the homepage hero, each frame drifting slowly
 * as it holds (a Ken Burns move) so a still photo doesn't read as a dead
 * background.
 *
 * All frames are stacked and only opacity changes, so there is no layout shift
 * and no gap between slides.
 *
 * Three things this deliberately does NOT do:
 *  - It never moves the headline. The text sits in a sibling layer above.
 *  - It does not animate when the visitor prefers reduced motion — it holds the
 *    first frame, which is a still hero rather than a broken one.
 *  - It does not advance while the tab is hidden, so a backgrounded tab isn't
 *    decoding JPEGs for nobody.
 */
export function HeroSlideshow() {
  const [index, setIndex] = useState(0)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (heroSlides.length < 2) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (reduce?.matches) return

    setAnimate(true)

    let timer = 0
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (!document.hidden) setIndex((current) => (current + 1) % heroSlides.length)
        schedule()
      }, HOLD)
    }

    schedule()
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden>
      {heroSlides.map((slide, position) => {
        const active = position === index

        return (
          <div
            key={slide.url}
            className={cn(
              'absolute inset-0 transition-opacity ease-in-out',
              active ? 'opacity-60' : 'opacity-0',
            )}
            style={{ transitionDuration: `${FADE}ms` }}
          >
            <img
              src={slide.url}
              alt=""
              fetchPriority={position === 0 ? 'high' : 'low'}
              loading={position === 0 ? 'eager' : 'lazy'}
              decoding="async"
              /* Re-keyed on each activation so the drift restarts per turn. */
              key={active ? `${slide.url}-on` : `${slide.url}-off`}
              className={cn(
                'size-full object-cover object-center',
                active && animate ? 'ken-burns' : 'scale-[1.04]',
              )}
            />
          </div>
        )
      })}
    </div>
  )
}
