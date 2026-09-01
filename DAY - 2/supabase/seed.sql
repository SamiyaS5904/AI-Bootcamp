-- ============================================================================
-- Saints Crew — SAMPLE seed data
--
-- READ THIS BEFORE LAUNCH.
--
-- Every product below is SAMPLE DATA, named with a literal "Sample — " prefix
-- so it is impossible to mistake for a real listing anywhere in the UI, in the
-- Supabase dashboard, or in an order confirmation. Its purpose is to make the
-- store fully functional and previewable before real photography and copy
-- exist (CLAUDE.md §8).
--
-- Descriptions, fabric and care fields carry the {{TODO: copy needed — ...}}
-- marker rather than invented product copy. Those strings render as visible
-- placeholders on the PDP, exactly like the ones in `src/config/site.ts`.
--
-- Prices, sizes and stock quantities ARE plausible working values — they have
-- to be, or filtering, sorting, stock-awareness and shipping thresholds can't
-- be exercised. They are not brand-approved.
--
-- Images are deterministic SVG placeholders generated inline as data URIs, so
-- there is no dependency on an external image host and nothing to download.
-- Replace with Supabase Storage URLs once real photography exists.
--
-- TO REMOVE ALL OF THIS before going live:
--   delete from public.products where name like 'Sample — %';
-- (product_images and product_variants cascade.)
--
-- Categories and the size chart are NOT sample data — those are real
-- structural rows the app requires, and their slugs must match
-- `src/config/routes.ts`.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Categories — real rows. Slugs match categoryNav in src/config/routes.ts.
-- ----------------------------------------------------------------------------
insert into public.categories (name, slug, position) values
  ('Knitwear', 'knitwear', 1),
  ('Shirts',   'shirts',   2),
  ('Trousers', 'trousers', 3)
on conflict (slug) do nothing;


-- ----------------------------------------------------------------------------
-- Size chart — structural rows the Size Finder maps onto (§5.7).
--
-- Measurements are in inches, using standard Indian menswear grading. These are
-- reasonable working values but MUST be replaced with Saints Crew's actual
-- garment measurements before launch — a wrong size chart is worse than none.
-- Editable in this table with no redeploy, which is the point of §5.7.
-- ----------------------------------------------------------------------------
insert into public.size_chart (category_id, size_label, measurements, position)
select c.id, s.size_label, s.measurements::jsonb, s.position
from public.categories c
cross join (values
  ('XS', '{"chest_in": 36, "length_in": 26, "shoulder_in": 16.5}', 1),
  ('S',  '{"chest_in": 38, "length_in": 27, "shoulder_in": 17.0}', 2),
  ('M',  '{"chest_in": 40, "length_in": 28, "shoulder_in": 17.5}', 3),
  ('L',  '{"chest_in": 42, "length_in": 29, "shoulder_in": 18.0}', 4),
  ('XL', '{"chest_in": 44, "length_in": 30, "shoulder_in": 18.5}', 5),
  ('XXL','{"chest_in": 46, "length_in": 31, "shoulder_in": 19.0}', 6)
) as s(size_label, measurements, position)
where c.slug in ('knitwear', 'shirts')
on conflict (category_id, size_label) do nothing;

-- Trousers grade on waist, not chest.
insert into public.size_chart (category_id, size_label, measurements, position)
select c.id, s.size_label, s.measurements::jsonb, s.position
from public.categories c
cross join (values
  ('28', '{"waist_in": 28, "inseam_in": 30, "hip_in": 36}', 1),
  ('30', '{"waist_in": 30, "inseam_in": 30, "hip_in": 38}', 2),
  ('32', '{"waist_in": 32, "inseam_in": 31, "hip_in": 40}', 3),
  ('34', '{"waist_in": 34, "inseam_in": 31, "hip_in": 42}', 4),
  ('36', '{"waist_in": 36, "inseam_in": 32, "hip_in": 44}', 5),
  ('38', '{"waist_in": 38, "inseam_in": 32, "hip_in": 46}', 6)
) as s(size_label, measurements, position)
where c.slug = 'trousers'
on conflict (category_id, size_label) do nothing;


-- ----------------------------------------------------------------------------
-- Placeholder image generator.
--
-- Builds an inline SVG data URI in the brand palette, labelled with the shot
-- type. Self-contained: no external host, no binary assets in the repo, and
-- visibly a placeholder rather than a stock photo standing in for real work.
-- ----------------------------------------------------------------------------
create or replace function pg_temp.sample_image(label text, shot text, bg text)
returns text
language sql
immutable
as $$
  select 'data:image/svg+xml;charset=utf-8,' || replace(replace(replace(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">'
    '<rect width="800" height="1000" fill="' || bg || '"/>'
    '<text x="400" y="480" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="#8C8579">' || label || '</text>'
    '<text x="400" y="530" text-anchor="middle" font-family="Helvetica,Arial" font-size="19" letter-spacing="3" fill="#A85C3B">' || upper(shot) || '</text>'
    '<text x="400" y="580" text-anchor="middle" font-family="Helvetica,Arial" font-size="15" letter-spacing="2" fill="#8C8579">SAMPLE IMAGE</text>'
    '</svg>',
    '#', '%23'), '"', '%22'), '<', '%3C');
$$;


-- ----------------------------------------------------------------------------
-- Sample products — 9 across the three categories, enough to exercise
-- filtering, sorting, price ranges, sold-out states and related products.
-- ----------------------------------------------------------------------------
insert into public.products
  (name, slug, category_id, description, fabric, fit_type, care_instructions, price, is_active)
select
  p.name, p.slug, c.id,
  '{{TODO: copy needed — product description for ' || p.name || '}}',
  '{{TODO: copy needed — fabric composition}}',
  p.fit_type,
  '{{TODO: copy needed — care instructions}}',
  p.price,
  true
from public.categories c
join (values
  -- Knitwear
  ('Sample — Merino Crew Neck',     'sample-merino-crew-neck',     'knitwear', 'regular', 3800),
  ('Sample — Cotton Knit Polo',     'sample-cotton-knit-polo',     'knitwear', 'slim',    2900),
  ('Sample — Relaxed Cardigan',     'sample-relaxed-cardigan',     'knitwear', 'relaxed', 4600),
  -- Shirts
  ('Sample — Oxford Shirt',         'sample-oxford-shirt',         'shirts',   'regular', 2400),
  ('Sample — Linen Camp Collar',    'sample-linen-camp-collar',    'shirts',   'relaxed', 2700),
  ('Sample — Poplin Dress Shirt',   'sample-poplin-dress-shirt',   'shirts',   'slim',    2600),
  -- Trousers
  ('Sample — Pleated Trouser',      'sample-pleated-trouser',      'trousers', 'relaxed', 3400),
  ('Sample — Cotton Chino',         'sample-cotton-chino',         'trousers', 'regular', 2900),
  ('Sample — Tapered Wool Trouser', 'sample-tapered-wool-trouser', 'trousers', 'slim',    4200)
) as p(name, slug, category_slug, fit_type, price)
  on p.category_slug = c.slug
on conflict (slug) do nothing;


-- ----------------------------------------------------------------------------
-- Images — three per product, matching §5.2's minimum: full look, fabric
-- close-up, fit-on-body. Alt text is real and descriptive (§7), and states
-- plainly that the image is a placeholder.
-- ----------------------------------------------------------------------------
insert into public.product_images (product_id, url, position, alt_text)
select p.id, pg_temp.sample_image(p.name, i.shot, i.bg), i.position,
       'Placeholder image standing in for the ' || i.shot || ' shot of ' || p.name ||
       '. Real photography pending.'
from public.products p
cross join (values
  ('full look',      '#ECE7DE', 0),
  ('fabric close-up','#E3DCD1', 1),
  ('fit on body',    '#D9D2C6', 2)
) as i(shot, bg, position)
where p.name like 'Sample — %'
on conflict (product_id, position) do nothing;


-- ----------------------------------------------------------------------------
-- Variants — one color per product across the category's size run.
--
-- Stock is varied on purpose, including two deliberate zeros, so the PDP's
-- out-of-stock size handling (§5.2) and the card's "Sold out" state (§5.1) are
-- both reachable in a preview without editing data by hand.
-- ----------------------------------------------------------------------------

-- Tops (knitwear + shirts): XS–XXL
insert into public.product_variants (product_id, size, color, stock_qty, sku)
select
  p.id, s.size, 'Ecru', s.stock,
  upper(replace(replace(p.slug, 'sample-', 'SMP-'), '-', '')) || '-' || s.size
from public.products p
join public.categories c on c.id = p.category_id
cross join (values
  ('XS', 4), ('S', 9), ('M', 12), ('L', 7), ('XL', 3), ('XXL', 0)
) as s(size, stock)
where p.name like 'Sample — %' and c.slug in ('knitwear', 'shirts')
on conflict (product_id, size, color) do nothing;

-- Trousers: waist sizes
insert into public.product_variants (product_id, size, color, stock_qty, sku)
select
  p.id, s.size, 'Stone', s.stock,
  upper(replace(replace(p.slug, 'sample-', 'SMP-'), '-', '')) || '-W' || s.size
from public.products p
join public.categories c on c.id = p.category_id
cross join (values
  ('28', 2), ('30', 8), ('32', 11), ('34', 6), ('36', 3), ('38', 0)
) as s(size, stock)
where p.name like 'Sample — %' and c.slug = 'trousers'
on conflict (product_id, size, color) do nothing;


-- One product fully sold out, so the grid's "Sold out" card state is visible.
update public.product_variants
set stock_qty = 0
where product_id = (select id from public.products where slug = 'sample-relaxed-cardigan');
