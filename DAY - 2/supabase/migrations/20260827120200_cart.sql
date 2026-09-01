-- ============================================================================
-- Saints Crew — 03. Cart
--
-- carts, cart_items
--
-- §5.3: the cart persists across sessions, server-side, for logged-in users and
-- for guests via a Supabase anonymous session. Both cases are the same shape
-- here — an anonymous visitor has a real auth.uid(), so `customer_id` is set
-- either way and RLS is a single `= auth.uid()` check.
--
-- It stays nullable per §6, for the one case that needs it: an Edge Function
-- using the service-role key reconciling an abandoned cart. Application code
-- must always set it.
-- ============================================================================

create table public.carts (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.carts is
  'One active cart per session-holder. customer_id is the auth.uid() of either a registered or an anonymous user.';

-- One cart per user. Without this, a double-tap on "add to bag" during signup
-- can create two carts and half the items vanish from view.
create unique index carts_one_per_customer
  on public.carts (customer_id)
  where customer_id is not null;

create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- cart_items
--
-- Points at a variant, not a product: size is part of what's in the bag.
-- No price column — cart totals are always recomputed from the live
-- `products.price`, so a price change is never silently stale in someone's bag.
-- Price is frozen only at purchase, in order_items.
-- ----------------------------------------------------------------------------
create table public.cart_items (
  id                 uuid primary key default gen_random_uuid(),
  cart_id            uuid not null references public.carts (id) on delete cascade,
  product_variant_id uuid not null references public.product_variants (id) on delete cascade,
  qty                integer not null default 1 check (qty > 0 and qty <= 10),
  created_at         timestamptz not null default now(),

  -- Adding the same variant twice bumps qty instead of creating a second line.
  unique (cart_id, product_variant_id)
);

comment on column public.cart_items.qty is
  'Capped at 10 — a per-line sanity limit, not a stock check. Stock is verified against product_variants at checkout.';

create index cart_items_cart_id_idx on public.cart_items (cart_id);
