# `src/data` — phase-1 local data

This directory exists **only because the backend isn't wired up yet**. It is the
single swap point between the UI and Supabase.

Everything here deliberately mirrors the real schema in
`supabase/migrations/` and the types in `src/types/models.ts`, so replacing it
is a change to these files and nothing else:

| File | Stands in for | Replace with |
| --- | --- | --- |
| `sampleCatalog.ts` | `products`, `product_variants`, `product_images`, `categories` | `src/features/shop/api/products.ts` querying Supabase |
| `sizeChart.ts` | `size_chart` | a query against `size_chart` |
| `siteSettings.ts` | `site_config` | a query against `site_config` |

## Rules this data follows

- **Every product name starts with `Sample — `.** CLAUDE.md §8 forbids content
  that could pass as real. The prefix appears in the grid, the PDP, the cart,
  the order summary and the confirmation page, so there is nowhere it looks
  like a genuine listing.
- **Descriptions, fabric and care fields carry `{{TODO: copy needed — …}}`**
  rather than invented product copy. They render as visible placeholder markers
  on the PDP.
- **Prices, sizes and stock are plausible working values**, because filtering,
  sorting, stock-awareness and the shipping threshold can't be exercised
  otherwise. They are not brand-approved.
- **Images are inline SVG data URIs** in the brand palette, labelled with the
  shot type. No external image host, no binary assets, and visibly a
  placeholder rather than a stock photo standing in for real work.

The same sample rows exist as SQL in `supabase/seed.sql`, so the preview you
see now matches what a seeded database will return.

## What is NOT sample data

`categories` and the size chart are real structural rows the app requires.
Category slugs must stay in step with `src/config/routes.ts`. The size chart's
measurements are standard Indian menswear grading — reasonable, but they must be
replaced with Saints Crew's actual garment measurements before launch.
