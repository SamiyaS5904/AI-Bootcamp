import { useLocation } from 'react-router-dom'

/**
 * Fades page content in on navigation.
 *
 * A hard content swap is the main thing that makes a client-rendered SPA feel
 * cheap. This is a fade-IN only, deliberately: React Router has already replaced
 * the tree by the time we hear about the change, so there is no outgoing page
 * left to fade out. Faking one would mean holding a stale copy of the previous
 * route and delaying every navigation by the fade duration.
 *
 * IMPLEMENTED AS A CSS ANIMATION, NOT JS STATE — this matters. An earlier
 * version started at `opacity-0` and flipped to visible inside
 * `requestAnimationFrame`. rAF does not fire in a hidden or heavily throttled
 * tab, so opening the site in a background tab left the entire page blank until
 * it was focused. A keyframe animation cannot fail that way: the element's
 * resting state is visible, and the animation only plays *toward* it. If
 * animations are disabled outright, the content is simply there.
 *
 * `key={pathname}` remounts the wrapper so the animation replays per route.
 * 200ms (§3: 150–250ms, "precise, not fun"). No library: framer-motion would
 * add ~40KB gzipped to a bundle §7 asks to keep lean, for one fade.
 * `prefers-reduced-motion` is collapsed globally in index.css.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()

  return (
    <div key={pathname} className="animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out">
      {children}
    </div>
  )
}
