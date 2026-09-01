-- ============================================================================
-- Saints Crew — 06. Style Assistant sessions, newsletter, site config
--
-- style_assistant_sessions, newsletter_subscribers, site_config
-- ============================================================================


-- ----------------------------------------------------------------------------
-- style_assistant_sessions (§5.6)
--
-- Every session is logged so we can see what people are actually asking for.
-- `answers` is jsonb rather than columns because the question set will change
-- as the flow is refined, and a schema migration per tweak is not worth it.
-- Expected shape: {"category":"shirts","occasion":"office","fit":"regular",
--                  "size":"M","budget_max":3000}
--
-- `recommended_product_ids` is a plain uuid[] (§6). No FK — an array can't have
-- one — which is fine: this is an analytics log, and it should survive a
-- product being deleted rather than losing the record of what was recommended.
-- ----------------------------------------------------------------------------
create table public.style_assistant_sessions (
  id                      uuid primary key default gen_random_uuid(),
  -- Null only if the Edge Function is called without any session at all.
  -- Anonymous visitors do have an auth.uid().
  customer_id             uuid references auth.users (id) on delete set null,
  answers                 jsonb not null,
  recommended_product_ids uuid[] not null default '{}',
  created_at              timestamptz not null default now()
);

comment on table public.style_assistant_sessions is
  'Append-only log of Style Assistant runs (§5.6). Informs future catalog decisions; not a user-facing feature.';

create index style_assistant_sessions_created_idx
  on public.style_assistant_sessions (created_at desc);


-- ----------------------------------------------------------------------------
-- newsletter_subscribers (§5.11)
--
-- `discount_code` is nullable and stays null for now — §5.11 and §8 say a
-- promised discount must actually be issued by the system, and no code
-- generation exists yet. The footer copy therefore promises early access, not a
-- percentage off. If that copy changes to an offer, populate this column at the
-- same time; a promise with a null code here is exactly the failure §8 forbids.
-- ----------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id             uuid primary key default gen_random_uuid(),
  -- citext would be neater, but lower() on insert keeps the extension list
  -- short. Uniqueness is enforced on the normalised value below.
  email          text not null,
  subscribed_at  timestamptz not null default now(),
  discount_code  text,
  -- Lets us suppress sends without deleting the record.
  unsubscribed_at timestamptz,

  constraint newsletter_subscribers_email_format
    check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create unique index newsletter_subscribers_email_unique
  on public.newsletter_subscribers (lower(email));

comment on column public.newsletter_subscribers.discount_code is
  'Null until code generation exists. Do not promise a discount in UI copy while this is unimplemented (§8).';


-- ----------------------------------------------------------------------------
-- site_config (§5.3, §6)
--
-- Key/value, so adding a setting needs no migration. This exists specifically
-- so the free-shipping threshold has exactly ONE home: the old site showed ₹600
-- in one place and ₹6000 in another. Cart, PDP and the Shipping page all read
-- this row.
--
-- Values are jsonb so a number stays a number rather than a string that has to
-- be parsed at three call sites.
-- ----------------------------------------------------------------------------
create table public.site_config (
  key         text primary key,
  value       jsonb not null,
  description text not null,
  updated_at  timestamptz not null default now()
);

comment on table public.site_config is
  'Public-read key/value settings. The single source of truth for customer-facing numbers (§5.3).';

create trigger site_config_set_updated_at
  before update on public.site_config
  for each row execute function public.set_updated_at();

-- Seeded with the keys the app will read. Values confirmed with the brand on
-- 2026-08-27 (see DECISIONS.md) — these are real numbers, not placeholders, and
-- remain editable here without a redeploy.
insert into public.site_config (key, value, description) values
  ('free_shipping_threshold_inr', '2000'::jsonb,
   'Order subtotal in whole rupees at which shipping becomes free. Shown in cart, PDP and Shipping & Returns.'),
  ('standard_shipping_fee_inr', '99'::jsonb,
   'Flat shipping fee in whole rupees below the free-shipping threshold.'),
  ('returns_window_days', '7'::jsonb,
   'Days after delivery within which a return can be raised.');
