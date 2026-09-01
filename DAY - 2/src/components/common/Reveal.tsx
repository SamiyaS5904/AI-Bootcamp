import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Fades and lifts its children into view once, when they first scroll into
 * frame.
 *
 * CLAUDE.md §3 asks for motion that feels "precise, not fun" — so this is a
 * short fade with a small 12px lift, no bounce, no scale. Once revealed it
 * never animates again (the observer disconnects), because content that
 * re-animates on every scroll-past reads as a gimmick.
 *
 * `prefers-reduced-motion` is handled globally in index.css, which collapses
 * every transition to ~0ms — the content still ends up visible.
 */
export function Reveal({
  children,
  /** Stagger, in ms. Use the item index for a cascading grid. */
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li'
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // If IntersectionObserver is unavailable, show immediately rather than
    // leaving content permanently invisible.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      // Fire slightly before the element reaches the viewport edge, so the
      // motion has finished by the time it's properly in view.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )

    observer.observe(node)

    /**
     * Failsafe. This component starts its children at `opacity-0`, so anything
     * that stops the observer from ever firing would hide real content — and
     * this wraps the product grid, which is the page's whole point. Reveal
     * unconditionally after a second, whatever the observer did.
     */
    const failsafe = window.setTimeout(() => setVisible(true), 1000)

    return () => {
      observer.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={cn(
        'transition-[opacity,translate] duration-[450ms] ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
