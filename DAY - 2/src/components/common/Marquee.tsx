import { cn } from '@/lib/utils'

/**
 * Slow scrolling band of brand statements.
 *
 * The track holds the items twice and travels exactly -50%, so the loop is
 * seamless with no JS and no measurement. `aria-hidden` on the duplicate keeps
 * a screen reader from hearing everything twice.
 *
 * Motion stops entirely under `prefers-reduced-motion` (handled globally in
 * index.css), leaving a static band rather than a broken one.
 */
export function Marquee({
  items,
  className,
  /** Seconds for one full pass. Longer = calmer. */
  duration = 44,
}: {
  items: string[]
  className?: string
  duration?: number
}) {
  const Row = ({ hidden }: { hidden?: boolean }) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-center">
          <span className="font-display px-8 text-2xl whitespace-nowrap md:px-12 md:text-3xl">
            {item}
          </span>
          {/* Diamond separator — quieter than a bullet, more considered than a dash. */}
          <span className="text-clay text-[0.5rem]" aria-hidden>
            ◆
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <div
      className={cn('group relative flex overflow-hidden py-6 select-none', className)}
      style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
    >
      <div className="marquee-track flex">
        <Row />
        <Row hidden />
      </div>
    </div>
  )
}
