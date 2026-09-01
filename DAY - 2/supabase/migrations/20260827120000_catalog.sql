-- ============================================================================
-- Saints Crew — 01. Catalog
--
-- categories, products, product_variants, product_images, size_chart
--
-- All public-read (CLAUDE.md §6: "product/category/size_chart data is
-- public-read"). Writes are staff-only, done through the Supabase dashboard or
-- an Edge Function using the service-role key — there is no admin UI (§9).
-- ============================================================================

-- gen_random_uuid() lives here. Present by default on Supabase; included so a
-- fresh local `supabase db reset` works too.
create extension if not exists "pgcrypto";


-- ----------------------------------------------------------------------------
-- categories
-- Exactly three rows to start: knitwear, shirts, trousers. The `slug` values
-- must match src/config/routes.ts `categoryNav`, because /shop/:category
-- resolves against them.
-- ----------------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  -- Controls nav ordering without relying on alphabetical accident.
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

comment on table public.categories is
  'Product categories. Slugs are user-visible URLs (/shop/knitwear) — changing one breaks existing links.';


-- ----------------------------------------------------------------------------
-- products
--
-- `price` is whole rupees, not paise. Indian retail prices are always whole
-- rupees and numeric(10,2) invites a paise/rupee mix-up in the Razorpay call
-- (Razorpay wants paise, so the Edge Function multiplies by 100 at exactly one
-- boundary). integer makes that boundary obvious.
--
-- `fit_type` is constrained rather than free text: the Style Assistant filters
-- on it (§5.6, fit preference) and a stray 'Regular Fit' would silently drop a
-- product out of every recommendation.
-- ----------------------------------------------------------------------------
create table public.products (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  slug               text not null unique,
  category_id        uuid not null references public.categories (id) on delete restrict,
  description        text not null,

  -- The fit/fabric detail that is the entire point of this store (§5.2).
  fabric             text not null,
  fit_type           text not null check (fit_type in ('slim', 'regular', 'relaxed')),
  care_instructions  text not null,

  price              integer not null check (price > 0),

  is_active          boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on column public.products.price is
  'Whole rupees (e.g. 2400 = ₹2,400). Convert to paise only at the Razorpay boundary.';
comment on column public.products.is_active is
  'Defaults to false so a half-entered product cannot appear in the shop.';

create index products_category_id_idx on public.products (category_id);
-- Supports the default /shop listing: active products, newest first.
create index products_active_created_idx on public.products (created_at desc) where is_active;


-- ----------------------------------------------------------------------------
-- product_variants
-- One row per sellable size/color combination. This is what a cart line, a
-- wishlist stock check and an order line all point at — never `products`
-- directly, because stock is per-variant.
-- ----------------------------------------------------------------------------
create table public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  size        text not null,
  color       text not null,
  stock_qty   integer not null default 0 check (stock_qty >= 0),
  sku         text not null unique,
  created_at  timestamptz not null default now(),

  -- Prevents two rows for the same size+color, which would split stock in two
  -- and let the PDP show a size as available when it isn't.
  unique (product_id, size, color)
);

comment on table public.product_variants is
  'Sellable units. stock_qty = 0 means the PDP size selector disables that size (§5.2).';

create index product_variants_product_id_idx on public.product_variants (product_id);


-- ----------------------------------------------------------------------------
-- product_images
-- §5.2 requires at least three per product: full look, fabric close-up,
-- fit-on-body. `alt_text` is not null because §7 requires real alt text.
-- ----------------------------------------------------------------------------
create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  -- Supabase Storage public URL, or a storage path resolved client-side.
  url         text not null,
  position    integer not null default 0,
  alt_text    text not null,
  created_at  timestamptz not null default now(),

  -- Deterministic gallery order; position 0 is the card's primary image and
  -- position 1 is the hover image (§5.1).
  unique (product_id, position)
);

comment on column public.product_images.alt_text is
  'Required, not optional — §7 Accessibility. Describe the garment and the shot, not "product image".';

create index product_images_product_id_position_idx on public.product_images (product_id, position);


-- ----------------------------------------------------------------------------
-- size_chart
-- §5.7: stored here, never hardcoded in the frontend, so a wrong measurement
-- can be corrected without a redeploy.
-- ----------------------------------------------------------------------------
create table public.size_chart (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.categories (id) on delete cascade,
  size_label    text not null,
  -- e.g. {"chest_in": 40, "waist_in": 34, "length_in": 28}. jsonb because
  -- trousers and shirts measure different things.
  measurements  jsonb not null,
  position      integer not null default 0,
  created_at    timestamptz not null default now(),

  unique (category_id, size_label)
);

comment on table public.size_chart is
  'Per-category measurements. The Size Finder (§5.7) maps a customer answer onto these rows.';


-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
-- Empty search_path: this function runs with the caller's privileges but should
-- never resolve an unqualified name from a caller-controlled schema.
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();
