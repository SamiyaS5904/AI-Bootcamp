-- ============================================================================
-- Saints Crew — 02. Customers & addresses
--
-- customers, addresses
--
-- IMPORTANT DESIGN NOTE (a deliberate deviation from a literal reading of §6):
-- every table that §6 describes as referencing `customers` instead references
-- `auth.users` directly. Reason: §5.3 and §5.4 require guest carts and guest
-- checkout via Supabase anonymous auth. An anonymous visitor HAS an auth.uid()
-- but has no profile — no name, no phone — so forcing a `customers` row for
-- them would mean inserting an empty profile for every visitor.
--
-- `customers` is therefore a profile table for people who signed up, and
-- ownership everywhere else is `auth.uid()`. This keeps every RLS policy
-- expressible as `user_id = auth.uid()`, which is the only form Postgres can
-- check cheaply and the only form that is obviously correct on review.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- customers — profile for a registered account (§5.9)
-- ----------------------------------------------------------------------------
create table public.customers (
  -- Same id as the auth user. One profile per account, enforced by the PK.
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.customers is
  'Profile for registered accounts. Anonymous/guest sessions have an auth.uid() but no row here.';

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- addresses — saved delivery addresses (§5.4)
-- ----------------------------------------------------------------------------
create table public.addresses (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,

  name        text not null,
  phone       text not null,
  line1       text not null,
  line2       text,
  city        text not null,
  state       text not null,
  pincode     text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  country     text not null default 'IN',

  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.addresses.pincode is
  'Indian PIN code: six digits, first digit non-zero. Checked here so a bad value never reaches the courier.';

create index addresses_customer_id_idx on public.addresses (customer_id);

-- At most one default address per customer. A partial unique index does this
-- without a trigger; a second default simply fails to insert.
create unique index addresses_one_default_per_customer
  on public.addresses (customer_id)
  where is_default;

create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();
