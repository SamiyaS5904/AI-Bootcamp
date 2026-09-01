import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Package, User } from 'lucide-react'
import { useWishlist } from '@/features/wishlist/WishlistContext'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { routes } from '@/config/routes'
import { cn } from '@/lib/utils'

/**
 * Account — CLAUDE.md §5.9.
 *
 * Signed-out state is the whole page for now: a proper sign-in panel beside the
 * three things an account gives you. Order history and saved addresses show
 * genuine empty states rather than invented orders (§8) — an account with no
 * orders would look exactly like this anyway, so nothing here misleads.
 *
 * Wiring: swap `onSubmit` for Supabase Auth and replace the two empty states
 * with queries. The layout does not need to change.
 */
export function AccountPage() {
  const wishlist = useWishlist()
  const [mode, setMode] = useState<'signin' | 'register'>('signin')

  return (
    <>
      <Seo title="Account" noIndex />

      <div className="container-page py-14 md:py-20">
        <p className="eyebrow text-clay">Account</p>
        <h1 className="text-display mt-4">Your account</h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed">
          Track an order, keep your addresses for next time, and pick your wishlist back up on any
          device.
        </p>

        <div className="mt-14 grid gap-14 lg:grid-cols-[22rem_1fr] lg:gap-20">
          {/* Sign in / register */}
          <div>
            <div className="border-border flex gap-1 border-b" role="tablist">
              <TabButton active={mode === 'signin'} onClick={() => setMode('signin')}>
                Sign in
              </TabButton>
              <TabButton active={mode === 'register'} onClick={() => setMode('register')}>
                Create account
              </TabButton>
            </div>

            <form className="mt-8 space-y-5" onSubmit={(event) => event.preventDefault()}>
              {mode === 'register' && (
                <Field label="Name" htmlFor="account-name">
                  <Input id="account-name" autoComplete="name" placeholder="Your name" />
                </Field>
              )}

              <Field label="Email" htmlFor="account-email">
                <Input
                  id="account-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </Field>

              <Field
                label="Password"
                htmlFor="account-password"
                hint={mode === 'register' ? 'At least 8 characters.' : undefined}
              >
                <Input
                  id="account-password"
                  type="password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                />
              </Field>

              <Button type="submit" size="lg" className="w-full">
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </Button>

              {mode === 'signin' && (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-clay text-xs transition-colors"
                >
                  Forgotten your password?
                </button>
              )}
            </form>

            <p className="text-muted-foreground mt-8 text-xs leading-relaxed">
              You never need an account to buy — checkout works as a guest.
            </p>
          </div>

          {/* What an account holds */}
          <div className="space-y-14">
            <Panel icon={<Package className="size-4" strokeWidth={1.5} />} title="Order history">
              <EmptyPanel
                heading="No orders yet"
                body="Once you order, it will show here with its current status and tracking."
                action={{ label: 'Start shopping', to: routes.shop }}
              />
            </Panel>

            <Panel icon={<MapPin className="size-4" strokeWidth={1.5} />} title="Saved addresses">
              <EmptyPanel
                heading="No addresses saved"
                body="Save an address at checkout and it will be ready to reuse next time."
              />
            </Panel>

            <Panel
              icon={<Heart className="size-4" strokeWidth={1.5} />}
              title="Wishlist"
              action={
                wishlist.count > 0 ? (
                  <Link to={routes.wishlist} className="text-clay text-xs hover:underline">
                    View all {wishlist.count}
                  </Link>
                ) : null
              }
            >
              {wishlist.count === 0 ? (
                <EmptyPanel
                  heading="Nothing saved yet"
                  body="Tap the heart on any piece and it will wait for you here."
                  action={{ label: 'Browse the shop', to: routes.shop }}
                />
              ) : (
                <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 md:gap-x-8">
                  {wishlist.items.slice(0, 3).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </Panel>

            <Panel icon={<User className="size-4" strokeWidth={1.5} />} title="Profile">
              <EmptyPanel
                heading="Sign in to edit your details"
                body="Your name, email and phone number live here once you have an account."
              />
            </Panel>
          </div>
        </div>
      </div>
    </>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'eyebrow -mb-px border-b-2 px-4 py-3 transition-colors',
        active
          ? 'border-clay text-clay'
          : 'text-muted-foreground hover:text-foreground border-transparent',
      )}
    >
      {children}
    </button>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm">
        {label}
      </label>
      {children}
      {hint && <p className="text-muted-foreground mt-1.5 text-xs">{hint}</p>}
    </div>
  )
}

function Panel({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-clay" aria-hidden>
            {icon}
          </span>
          <h2 className="eyebrow text-muted-foreground">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function EmptyPanel({
  heading,
  body,
  action,
}: {
  heading: string
  body: string
  action?: { label: string; to: string }
}) {
  return (
    <div className="border-border rounded-md border border-dashed px-6 py-12 text-center">
      <p className="text-sm font-medium">{heading}</p>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">{body}</p>
      {action && (
        <Button asChild variant="outline" size="sm" className="mt-6">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
