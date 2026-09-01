import { useEffect, useRef, useState } from 'react'

/** Scroll distance before the header condenses. */
const CONDENSE_AT = 24
/** Ignore jitter below this, or the header flickers on trackpads. */
const DIRECTION_THRESHOLD = 8
/** Never hide the header inside this zone — the nav is always reachable. */
const ALWAYS_VISIBLE_ABOVE = 140

export type HeaderScrollState = {
  /** Past the top — the header takes a border and tightens up. */
  condensed: boolean
  /** Scrolling down, far enough from the top to hide the bar. */
  hidden: boolean
}

/**
 * Drives the header's scroll behaviour: condense once you leave the top, then
 * slide out of the way going down and return immediately on the way up.
 *
 * Deliberately does NOT batch through `requestAnimationFrame`. rAF is paused in
 * any context that isn't compositing — background tabs, and some embedded
 * webviews — which left the header frozen at its initial state there. Reading
 * `window.scrollY` is a cheap cached read that doesn't force layout, and React
 * batches the resulting state updates, so handling scroll directly is both
 * simpler and more robust. The listener is passive, so it never blocks
 * scrolling.
 */
export function useHeaderScroll(): HeaderScrollState {
  const [state, setState] = useState<HeaderScrollState>({ condensed: false, hidden: false })
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY

    const update = () => {
      const y = window.scrollY
      const delta = y - lastY.current
      const condensed = y > CONDENSE_AT

      // Below the threshold this is jitter, not intent: update the condensed
      // state but leave the show/hide decision alone.
      if (Math.abs(delta) < DIRECTION_THRESHOLD) {
        setState((current) =>
          condensed === current.condensed ? current : { ...current, condensed },
        )
        return
      }

      const goingDown = delta > 0
      lastY.current = y

      setState((current) => {
        const next = {
          condensed,
          hidden: goingDown && y > ALWAYS_VISIBLE_ABOVE,
        }
        return next.condensed === current.condensed && next.hidden === current.hidden
          ? current
          : next
      })
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return state
}
