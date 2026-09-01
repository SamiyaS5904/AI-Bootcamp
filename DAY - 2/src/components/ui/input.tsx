import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * shadcn/ui Input, retuned for Saints Crew (CLAUDE.md §3 Forms):
 * minimal chrome, small radius, clay focus ring, and `aria-invalid` styling
 * ready for the inline validation the checkout and newsletter forms will need.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input placeholder:text-muted-foreground h-11 w-full rounded-md border bg-transparent px-3.5 py-2 text-sm transition-colors',
        'focus-visible:border-primary focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
