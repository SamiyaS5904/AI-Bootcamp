import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Thin clay bar across the top on every route change.
 *
 * This app renders routes instantly, so the bar is honest about being a
 * transition cue rather than a real loading measurement — it runs a fixed short
 * sweep and gets out of the way. It exists because an instant swap on a large
 * page can leave you unsure anything happened.
 *
 * Sits above the header but below the intro curtain.
 */
export function RouteProgress() {
  const { pathname } = useLocation()
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')

  useEffect(() => {
    // Skip the very first render — the page load itself isn't a route change.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    setPhase('running')
    const toDone = window.setTimeout(() => setPhase('done'), 260)
    const toIdle = window.setTimeout(() => setPhase('idle'), 560)

    return () => {
      window.clearTimeout(toDone)
      window.clearTimeout(toIdle)
    }
  }, [pathname])

  if (phase === 'idle') return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-100 h-0.5" aria-hidden>
      <div
        className="bg-clay h-full origin-left transition-all ease-out"
        style={{
          width: phase === 'done' ? '100%' : '65%',
          opacity: phase === 'done' ? 0 : 1,
          transitionDuration: phase === 'done' ? '300ms' : '260ms',
        }}
      />
    </div>
  )
}
