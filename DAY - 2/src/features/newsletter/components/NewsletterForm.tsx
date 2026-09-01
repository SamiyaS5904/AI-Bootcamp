import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * Newsletter signup — CLAUDE.md §5.11. Footer site-wide plus a homepage section.
 *
 * The incentive is "first access to new drops", not a percentage discount:
 * §5.11 and §8 require a promised code to actually be issued by the system, and
 * no code generation exists. Changing this copy to an offer means building that
 * first.
 *
 * Not yet wired to storage, so a submission acknowledges without claiming the
 * address was saved.
 */
export function NewsletterForm({
  className,
  /** `center` is used by the homepage section; the footer keeps the default. */
  align = 'start',
}: {
  className?: string
  align?: 'start' | 'center'
}) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'invalid' | 'acknowledged'>('idle')

  const centered = align === 'center'

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setState('invalid')
      return
    }
    setState('acknowledged')
  }

  return (
    <div className={cn('w-full max-w-sm', centered && 'text-center', className)}>
      <p className="text-sm leading-relaxed">
        First access to new drops — before they go live to everyone else.
      </p>

      {state === 'acknowledged' ? (
        <p className="text-moss mt-5 text-sm leading-relaxed" role="status">
          You&apos;re on the list. We&apos;ll be in touch before the next drop.
        </p>
      ) : (
        <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit} noValidate>
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <Input
            id="newsletter-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (state === 'invalid') setState('idle')
            }}
            aria-invalid={state === 'invalid'}
            aria-describedby={state === 'invalid' ? 'newsletter-error' : undefined}
            className="sm:flex-1"
          />
          <Button type="submit" variant="outline">
            Join
          </Button>
        </form>
      )}

      {state === 'invalid' && (
        <p id="newsletter-error" className="text-brick mt-2 text-xs" role="alert">
          That doesn&apos;t look like an email address.
        </p>
      )}
    </div>
  )
}
