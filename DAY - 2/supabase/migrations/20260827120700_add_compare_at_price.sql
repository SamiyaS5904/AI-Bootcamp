-- ============================================================================
-- Saints Crew — 08. Sale pricing + fit confirmation
--
-- Added after the initial schema review, because extracting the live catalog
-- from saintscrew.co.in surfaced two facts the original columns can't hold.
-- Kept as a separate migration so the reviewed files above stay untouched.
-- ============================================================================

-- Every product on the live store is discounted from an MRP (e.g. ₹4,999 marked
-- down to ₹1,599). Without this column that markdown is simply lost, and §3's
-- "no badges unless it's a genuine sale" has no way to know a sale is genuine.
--
-- Nullable: null means not on sale. The check stops an "increase" being
-- presented as a discount.
alter table public.products
  add column compare_at_price integer;

alter table public.products
  add constraint products_compare_at_price_above_price
  check (compare_at_price is null or compare_at_price > price);

comment on column public.products.compare_at_price is
  'MRP in whole rupees that price is discounted from. Null = not on sale. Must exceed price.';


-- fit_type drives the Style Assistant's single most important filter, but for
-- the imported catalog it was inferred from the garment type, not confirmed by
-- anyone. Defaulting to false means an unreviewed product is honest by default;
-- the PDP surfaces it to the customer.
alter table public.products
  add column fit_confirmed boolean not null default false;

comment on column public.products.fit_confirmed is
  'False = fit_type is a provisional guess and must not be presented as fact. Set true only after checking the finished garment.';
