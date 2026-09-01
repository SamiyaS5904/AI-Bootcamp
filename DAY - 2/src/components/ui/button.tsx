import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * shadcn/ui Button, retuned for Saints Crew (CLAUDE.md §3 Components):
 *  - `primary` is a solid clay fill — Add to Bag, Checkout, and nothing casual.
 *  - `outline` / `ghost` carry every secondary action.
 *  - Small radius only. No pill shapes; they read playful, and this brand isn't.
 *  - Uppercase tracked labels, matching the nav and eyebrow text.
 */
const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-sans text-xs font-medium uppercase tracking-nav whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-clay-dark',
        outline: 'border border-current/30 bg-transparent hover:border-current/60',
        ghost: 'bg-transparent hover:bg-foreground/5',
        /* Only for genuinely destructive confirmations — remove item, delete address. */
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
        link: 'h-auto p-0 normal-case tracking-normal underline underline-offset-4 hover:text-primary',
      },
      size: {
        sm: 'h-9 px-4',
        md: 'h-11 px-6',
        lg: 'h-13 px-8 text-[0.8125rem]',
        icon: 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Render as the single child element instead of a <button> — e.g. a <Link>. */
    asChild?: boolean
  }) {
  const Component = asChild ? Slot : 'button'
  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
