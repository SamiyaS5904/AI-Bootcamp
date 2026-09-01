import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Fades its children up once, the first time they scroll into view.
 *
 * FAIL-VISIBLE BY DESIGN. An earlier version started at `opacity-0` and waited
 * for an IntersectionObserver to grant visibility. That inverts the risk: any
 * environment where the observer or the transition doesn't run leaves real
 * content — including the product grid — permanently invisible, which was
 * observed in practice (elements carrying `opacity-100` still computing to 0).
 *
 * So the default is visible. We only hide an element after confirming, in a
 * layout effect before paint, that it is genuinely below the fold AND that an
 * observer exists to bring it back. Anything unexpected leaves the content on
 * screen, which is the correct way for a decorative effect to fail.
 *
 * Motion is a 450ms fade with a 12px lift, once — no bounce, no scale, and it
 * never replays. `prefers-reduced-motion` is collapsed globally in index.css.
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
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') return

    // Only worth animating if it starts off screen. Anything already in view
    // stays as it is — fading in content the visitor is already looking at is
    // the "unstable page" feeling we're trying to remove.
    const box = node.getBoundingClientRect()
    if (box.top < window.innerHeight * 0.92) return

    setVisible(false)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    observer.observe(node)

    // Backstop: whatever the observer does or doesn't do, the content is on
    // screen shortly after mount.
    const failsafe = window.setTimeout(() => setVisible(true), 1200)

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
