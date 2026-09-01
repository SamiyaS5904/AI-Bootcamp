import { useEffect, useRef, useState } from 'react'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

/** How long the wordmark holds before the panel starts lifting. */
const HOLD = 900
/** Length of the lift itself. */
const LIFT = 700

const SEEN_KEY = 'saintscrew.intro.seen'

type Phase = 'hidden' | 'showing' | 'lifting'

/**
 * First-visit brand curtain: the wordmark on ink, then the panel lifts away.
 *
 * Deliberate constraints, because an intro animation is the easiest thing in a
 * storefront to get wrong:
 *
 *  - It runs ONCE per browser session, not per navigation.
 *  - It never runs under `prefers-reduced-motion`.
 *  - It never blocks paint — the page renders underneath the whole time.
 *  - It is `aria-hidden` and non-interactive, so assistive tech and keyboard
 *    users go straight to the page.
 *
 * The timing sequence runs in a MOUNT-ONLY effect. An earlier version keyed the
 * effect on `phase`, which meant the flip to `lifting` re-ran the effect and its
 * cleanup cancelled the very timer that removes the curtain — leaving a
 * full-screen panel up and `body` locked at `overflow: hidden`. Scheduling both
 * steps once, from one effect, is what makes that impossible.
 */
export function IntroCurtain() {
  // Decided synchronously on first render, so nobody who should skip the
  // curtain ever sees a flash of it.
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window === 'undefined') return 'hidden'
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return 'hidden'
    } catch {
      // Storage blocked (private window). Showing it once is harmless.
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 'hidden'
    return 'showing'
  })

  // Whether this mount is responsible for running the sequence. Read once so
  // the effect below can stay mount-only without lying to the linter.
  const shouldRun = useRef(phase === 'showing')

  useEffect(() => {
    if (!shouldRun.current) return

    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      // Non-fatal — worst case it plays again on the next navigation.
    }

    const toLift = window.setTimeout(() => setPhase('lifting'), HOLD)
    const toDone = window.setTimeout(() => setPhase('hidden'), HOLD + LIFT)

    return () => {
      window.clearTimeout(toLift)
      window.clearTimeout(toDone)
    }
  }, [])

  // Hold the page still while the curtain is up. The cleanup always restores
  // the previous value, so an unmount at any point cannot strand the lock.
  useEffect(() => {
    if (phase === 'hidden') return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [phase])

  if (phase === 'hidden') return null

  return (
    <div
      className={cn(
        'bg-ink pointer-events-none fixed inset-0 z-200 flex items-center justify-center',
        'transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]',
        phase === 'lifting' && '-translate-y-full',
      )}
      style={{ transitionDuration: `${LIFT}ms` }}
      aria-hidden
    >
      <div className="overflow-hidden">
        <span
          className="text-bone font-display line-rise block text-[clamp(1.75rem,6vw,3.5rem)] tracking-tight"
          style={{ animationDelay: '60ms' }}
        >
          {siteConfig.name}
        </span>
      </div>
    </div>
  )
}
