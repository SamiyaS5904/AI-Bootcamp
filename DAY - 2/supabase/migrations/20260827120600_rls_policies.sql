-- ============================================================================
-- Saints Crew — 07. Row Level Security
--
-- §6: "Row Level Security must be enabled on every table containing customer,
-- order, cart, or wishlist data — customers can only read/write their own rows;
-- product/category/size_chart data is public-read."
--
-- RLS is enabled on EVERY table here, including the public-read catalog ones.
-- With RLS off, the anon key grants full read AND write — enabling it with an
-- explicit read-only policy is what makes the anon key safe to ship (see
-- .env.example).
--
-- Two roles matter:
--   anon           — not signed in at all
--   authenticated  — signed in, INCLUDING Supabase anonymous sessions
--
-- The service-role key used by Edge Functions bypasses RLS entirely. That is
-- intentional and is why orders are written only from an Edge Function: payment
-- must be verified server-side before an order is marked paid (§5.4).
--
-- `(select auth.uid())` rather than a bare `auth.uid()`: the subquery form is
-- evaluated once per statement instead of once per row, which matters as soon
-- as a table has more than a handful of rows.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- CATALOG — public read, no client writes.
--
-- Catalog edits happen in the Supabase dashboard (which uses service-role) or
-- via an Edge Function. §9 rules out building an admin UI, so there is
-- deliberately no insert/update/delete policy for any client role.
-- ----------------------------------------------------------------------------

alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.product_variants  enable row level security;
alter table public.product_images    enable row level security;
alter table public.size_chart        enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select
  to anon, authenticated
  using (true);

-- Only active products are visible. A draft product is invisible to clients
-- even if someone guesses its slug.
create policy "Active products are publicly readable"
  on public.products for select
  to anon, authenticated
  using (is_active);

-- Variants and images inherit their parent product's visibility, so a draft
-- product can't leak its price or photos through a child table.
create policy "Variants of active products are publicly readable"
  on public.product_variants for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_variants.product_id and p.is_active
    )
  );

create policy "Images of active products are publicly readable"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id and p.is_active
    )
  );

create policy "Size chart is publicly readable"
  on public.size_chart for select
  to anon, authenticated
  using (true);


-- ----------------------------------------------------------------------------
-- SITE CONFIG — public read, no client writes.
-- ----------------------------------------------------------------------------

alter table public.site_config enable row level security;

create policy "Site config is publicly readable"
  on public.site_config for select
  to anon, authenticated
  using (true);


-- ----------------------------------------------------------------------------
-- CUSTOMERS — own row only.
--
-- No delete policy: account deletion goes through auth.users, and the
-- `on delete cascade` on customers.id removes the profile with it.
-- ----------------------------------------------------------------------------

alter table public.customers enable row level security;

create policy "Customers can read their own profile"
  on public.customers for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Customers can create their own profile"
  on public.customers for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "Customers can update their own profile"
  on public.customers for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));


-- ----------------------------------------------------------------------------
-- ADDRESSES — own rows only.
--
-- Both `using` and `with check` on update: `using` decides which rows you may
-- target, `with check` decides what they may become. Without the second, a
-- customer could reassign one of their addresses to another customer_id.
-- ----------------------------------------------------------------------------

alter table public.addresses enable row level security;

create policy "Customers can read their own addresses"
  on public.addresses for select
  to authenticated
  using (customer_id = (select auth.uid()));

create policy "Customers can create their own addresses"
  on public.addresses for insert
  to authenticated
  with check (customer_id = (select auth.uid()));

create policy "Customers can update their own addresses"
  on public.addresses for update
  to authenticated
  using (customer_id = (select auth.uid()))
  with check (customer_id = (select auth.uid()));

create policy "Customers can delete their own addresses"
  on public.addresses for delete
  to authenticated
  using (customer_id = (select auth.uid()));


-- ----------------------------------------------------------------------------
-- CARTS — own cart only.
--
-- `to authenticated` covers guests too: §5.3 has guests on a Supabase
-- anonymous session, which authenticates as `authenticated` with a real uid.
-- A visitor with no session at all has no server-side cart, only local state.
--
-- Note `customer_id is not null` in the checks. Without it, the nullable column
-- would let a client insert a cart with customer_id = null and then match it
-- with `null = auth.uid()`... which is NULL, not true, so RLS would reject the
-- read and orphan the row. Requiring non-null makes the failure immediate
-- instead of silent.
-- ----------------------------------------------------------------------------

alter table public.carts enable row level security;

create policy "Customers can read their own cart"
  on public.carts for select
  to authenticated
  using (customer_id = (select auth.uid()));

create policy "Customers can create their own cart"
  on public.carts for insert
  to authenticated
  with check (customer_id is not null and customer_id = (select auth.uid()));

create policy "Customers can update their own cart"
  on public.carts for update
  to authenticated
  using (customer_id = (select auth.uid()))
  with check (customer_id is not null and customer_id = (select auth.uid()));

create policy "Customers can delete their own cart"
  on public.carts for delete
  to authenticated
  using (customer_id = (select auth.uid()));


-- ----------------------------------------------------------------------------
-- CART ITEMS — reachable only through a cart you own.
--
-- Ownership is one hop away, so every policy re-checks it via the parent. The
-- `carts_one_per_customer` unique index keeps that lookup to a single row.
-- ----------------------------------------------------------------------------

alter table public.cart_items enable row level security;

create policy "Customers can read items in their own cart"
  on public.cart_items for select
  to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.customer_id = (select auth.uid())
    )
  );

create policy "Customers can add items to their own cart"
  on public.cart_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.customer_id = (select auth.uid())
    )
  );

create policy "Customers can update items in their own cart"
  on public.cart_items for update
  to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.customer_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.customer_id = (select auth.uid())
    )
  );

create policy "Customers can remove items from their own cart"
  on public.cart_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.customer_id = (select auth.uid())
    )
  );


-- ----------------------------------------------------------------------------
-- ORDERS — read your own; NEVER write from the client.
--
-- Deliberately no insert or update policy for any client role. §5.4 requires
-- the Razorpay payment signature to be verified server-side before an order is
-- marked paid, so orders are created and mutated exclusively by Edge Functions
-- holding the service-role key, which bypasses RLS.
--
-- If a client could insert here it could invent a paid order for ₹0. Leaving
-- the policy out is the enforcement.
--
-- Guest order confirmation still works: a guest checks out on an anonymous
-- session, so customer_id is their anon uid and this select policy matches.
-- ----------------------------------------------------------------------------

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

create policy "Customers can read their own orders"
  on public.orders for select
  to authenticated
  using (customer_id is not null and customer_id = (select auth.uid()));

create policy "Customers can read items on their own orders"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id is not null
        and o.customer_id = (select auth.uid())
    )
  );


-- ----------------------------------------------------------------------------
-- WISHLIST — own rows only. Registered customers only (§5.8).
-- ----------------------------------------------------------------------------

alter table public.wishlists      enable row level security;
alter table public.wishlist_items enable row level security;

create policy "Customers can read their own wishlist"
  on public.wishlists for select
  to authenticated
  using (customer_id = (select auth.uid()));

create policy "Customers can create their own wishlist"
  on public.wishlists for insert
  to authenticated
  with check (customer_id = (select auth.uid()));

create policy "Customers can delete their own wishlist"
  on public.wishlists for delete
  to authenticated
  using (customer_id = (select auth.uid()));

create policy "Customers can read items in their own wishlist"
  on public.wishlist_items for select
  to authenticated
  using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.customer_id = (select auth.uid())
    )
  );

create policy "Customers can add items to their own wishlist"
  on public.wishlist_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.customer_id = (select auth.uid())
    )
  );

create policy "Customers can remove items from their own wishlist"
  on public.wishlist_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.customer_id = (select auth.uid())
    )
  );


-- ----------------------------------------------------------------------------
-- STYLE ASSISTANT SESSIONS — write-only from the client's point of view.
--
-- Insert is allowed so a session can be logged, but there is no select policy:
-- this is an internal log read via the dashboard or an Edge Function, and
-- nobody should be able to browse other people's answers.
--
-- In practice the Edge Function writes the row with the service-role key. The
-- insert policy exists so the client can log a session even if the function
-- later moves that responsibility.
-- ----------------------------------------------------------------------------

alter table public.style_assistant_sessions enable row level security;

create policy "Anyone can log a style assistant session"
  on public.style_assistant_sessions for insert
  to anon, authenticated
  with check (
    -- Either unattributed, or attributed to yourself — never to someone else.
    customer_id is null or customer_id = (select auth.uid())
  );


-- ----------------------------------------------------------------------------
-- NEWSLETTER SUBSCRIBERS — insert only, and not readable.
--
-- No select policy on purpose: a readable subscriber table with a public anon
-- key is an email list anyone can download.
--
-- KNOWN LIMITATION, worth naming rather than discovering later: because insert
-- is public and select is not, a duplicate signup hits the unique index and
-- returns a constraint error the client cannot distinguish from a real failure.
-- The clean fix is to route signup through an Edge Function that upserts with
-- the service-role key. Decide this when §5.11 is actually built.
-- ----------------------------------------------------------------------------

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe to the newsletter"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (
    -- A subscriber must not be able to hand themselves a discount code.
    discount_code is null
    and unsubscribed_at is null
  );
