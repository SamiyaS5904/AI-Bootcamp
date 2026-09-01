-- ============================================================================
-- Saints Crew — 05. Wishlist
--
-- wishlists, wishlist_items
--
-- §5.8: logged-in users only. Unlike carts, there is no guest case — so
-- customer_id is NOT NULL here.
--
-- wishlist_items points at `products`, not `product_variants`: you save a
-- garment, not a specific size. §5.8 requires the saved view to show current
-- stock and size availability, which is read live from product_variants at
-- render time rather than frozen when the item was saved.
-- ============================================================================

create table public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

comment on table public.wishlists is
  'One wishlist per customer, enforced by the unique constraint on customer_id.';


create table public.wishlist_items (
  id          uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  created_at  timestamptz not null default now(),

  -- Tapping the heart twice must not create a duplicate row.
  unique (wishlist_id, product_id)
);

create index wishlist_items_wishlist_id_idx on public.wishlist_items (wishlist_id);
