import { cn } from '@/lib/utils'

/**
 * Renders a deliberately ugly, unmistakable placeholder for content we don't
 * have yet — CLAUDE.md §8.
 *
 * The point is that this can NEVER be mistaken for real content if it ships by
 * accident. Use it anywhere a value from `siteConfig` is still `PENDING`, and
 * never substitute a plausible-looking fake instead.
 */
export function TodoMarker({ topic, className }: { topic: string; className?: string }) {
  return (
    <span
      className={cn(
        'bg-brick/15 text-brick ring-brick/40 inline-block rounded-sm px-1.5 py-0.5 font-mono text-[0.6875rem] leading-normal ring-1 ring-inset',
        className,
      )}
      title="Placeholder — real content required before launch"
    >
      {`{{TODO: ${topic}}}`}
    </span>
  )
}
