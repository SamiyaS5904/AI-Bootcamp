import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSiteSettings } from '@/data/siteSettings'
import { useCart } from '@/features/cart/CartContext'
import { cartTotals } from '@/features/cart/lib/pricing'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { routes } from '@/config/routes'
import { cn, formatPrice } from '@/lib/utils'

/**
 * Checkout — CLAUDE.md §5.4.
 *
 * Guest checkout by default: there is no account gate anywhere on this page.
 * Fields are the minimum §5.4 lists — name, phone, address, email — and the
 * order summary is visible throughout, so no cost appears only at the end.
 *
 * PHASE 1: no payment. Razorpay needs a merchant account and an Edge Function
 * to create and verify the order server-side, both deferred. The pay button
 * therefore says exactly what it does and routes to a demo confirmation. It
 * must not imply a charge was made.
 */
export function CheckoutPage() {
  const cart = useCart()
  const settings = useSiteSettings()
  const navigate = useNavigate()
  const totals = cartTotals(cart.lines, settings)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'We need a name for the delivery label.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, '')))
      next.phone = 'Enter a 10-digit Indian mobile number.'
    if (!form.line1.trim()) next.line1 = 'Street address is required.'
    if (!form.city.trim()) next.city = 'City is required.'
    if (!form.state.trim()) next.state = 'State is required.'
    if (!/^[1-9]\d{5}$/.test(form.pincode)) next.pincode = 'Enter a valid 6-digit PIN code.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    // No payment is taken. A demo order id makes that visible in the URL.
    navigate(routes.orderConfirmation('demo'))
  }

  if (cart.lines.length === 0) {
    return (
      <>
        <Seo title="Checkout" noIndex />
        <div className="container-page py-20 md:py-28">
          <div className="max-w-lg">
            <p className="eyebrow text-clay">Checkout</p>
            <h1 className="text-display mt-4">Your bag is empty</h1>
            <p className="text-muted-foreground mt-5 text-base leading-relaxed">
              Add something to your bag and the checkout will open here.
            </p>
            <Button asChild className="mt-10">
              <Link to={routes.shop}>Browse the shop</Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Seo title="Checkout" noIndex />

      <div className="container-page py-14 md:py-20">
        <p className="eyebrow text-clay">Checkout</p>
        <h1 className="text-display mt-4">Delivery details</h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-relaxed">
          No account needed. We ask for the least we can and still get the parcel to you.
        </p>

        <div className="border-border bg-muted/40 mt-8 max-w-xl rounded-md border px-5 py-4">
          <p className="eyebrow text-muted-foreground">Preview checkout</p>
          <p className="mt-2.5 text-sm leading-relaxed">
            Razorpay needs a merchant account and a server-side Edge Function to create and verify
            the order. Neither exists yet, so{' '}
            <strong>no card is charged and no order is placed</strong> — the button below only shows
            you the confirmation screen.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16"
        >
          <div className="space-y-8">
            <Fieldset legend="Contact">
              <Field label="Full name" error={errors.name} htmlFor="name">
                <Input
                  id="name"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Email"
                  error={errors.email}
                  htmlFor="email"
                  hint="For your order confirmation"
                >
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                </Field>
                <Field
                  label="Phone"
                  error={errors.phone}
                  htmlFor="phone"
                  hint="For delivery updates"
                >
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={set('phone')}
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                  />
                </Field>
              </div>
            </Fieldset>

            <Fieldset legend="Delivery address">
              <Field label="Address" error={errors.line1} htmlFor="line1">
                <Input
                  id="line1"
                  value={form.line1}
                  onChange={set('line1')}
                  autoComplete="address-line1"
                  aria-invalid={Boolean(errors.line1)}
                />
              </Field>
              <Field label="Apartment, landmark (optional)" htmlFor="line2">
                <Input
                  id="line2"
                  value={form.line2}
                  onChange={set('line2')}
                  autoComplete="address-line2"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="City" error={errors.city} htmlFor="city">
                  <Input
                    id="city"
                    value={form.city}
                    onChange={set('city')}
                    autoComplete="address-level2"
                    aria-invalid={Boolean(errors.city)}
                  />
                </Field>
                <Field label="State" error={errors.state} htmlFor="state">
                  <Input
                    id="state"
                    value={form.state}
                    onChange={set('state')}
                    autoComplete="address-level1"
                    aria-invalid={Boolean(errors.state)}
                  />
                </Field>
                <Field label="PIN code" error={errors.pincode} htmlFor="pincode">
                  <Input
                    id="pincode"
                    inputMode="numeric"
                    value={form.pincode}
                    onChange={set('pincode')}
                    autoComplete="postal-code"
                    aria-invalid={Boolean(errors.pincode)}
                  />
                </Field>
              </div>
              {/* §5.4 wants a save-address option for logged-in users. Auth is
                  deferred, so the control is deliberately absent rather than
                  present and inert. */}
            </Fieldset>
          </div>

          {/* Summary visible throughout, per §5.4. */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border-border rounded-md border p-6">
              <h2 className="eyebrow text-muted-foreground">Order summary</h2>

              <ul className="divide-border mt-5 divide-y">
                {cart.lines.map((line) => (
                  <li key={line.id} className="flex justify-between gap-3 py-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate">{line.variant.product.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {line.variant.size} · Qty {line.qty}
                      </span>
                    </span>
                    <span className="shrink-0">
                      {formatPrice(line.variant.product.price * line.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="border-border mt-4 space-y-3 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatPrice(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</dd>
                </div>
                <div className="border-border flex justify-between border-t pt-3 text-base">
                  <dt>Total</dt>
                  <dd>{formatPrice(totals.total)}</dd>
                </div>
              </dl>

              <Button type="submit" size="lg" className="mt-8 w-full">
                Continue (no payment)
              </Button>

              <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
                Returns within {settings.returnsWindowDays} days of delivery.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </>
  )
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="eyebrow text-muted-foreground">{legend}</legend>
      <div className="mt-5 space-y-5">{children}</div>
    </fieldset>
  )
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm">
        {label}
      </label>
      {children}
      <p className={cn('mt-1.5 text-xs', error ? 'text-brick' : 'text-muted-foreground')}>
        {error ?? hint ?? ''}
      </p>
    </div>
  )
}
