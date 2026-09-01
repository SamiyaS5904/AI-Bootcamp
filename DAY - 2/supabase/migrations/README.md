# Supabase migrations

Run in filename order. Later files depend on earlier ones — `set_updated_at()`
is defined in the catalog migration and used by several others.

| File | Contents |
| --- | --- |
| `20260827120000_catalog.sql` | `categories`, `products`, `product_variants`, `product_images`, `size_chart`, `set_updated_at()` |
| `20260827120100_customers.sql` | `customers`, `addresses` |
| `20260827120200_cart.sql` | `carts`, `cart_items` |
| `20260827120300_orders.sql` | `orders`, `order_items`, order-number sequence |
| `20260827120400_wishlist.sql` | `wishlists`, `wishlist_items` |
| `20260827120500_style_assistant_newsletter_config.sql` | `style_assistant_sessions`, `newsletter_subscribers`, `site_config` (+ seed rows) |
| `20260827120600_rls_policies.sql` | RLS enabled + policies for every table |

## Applying

Nothing has been applied yet. Two options:

**Supabase CLI** — recommended, keeps local and remote in step. `init` generates
`supabase/config.toml`, which isn't committed because the CLI owns its contents:

```bash
npx supabase init
```

```bash
npx supabase link --project-ref <your-project-ref>
```

```bash
npx supabase db push
```

**Dashboard SQL editor** — paste each file in the order above, one at a time.

Then regenerate the TypeScript types, which are currently a placeholder:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
```

## Deliberate deviations from CLAUDE.md §6

Both are flagged in comments at the top of the relevant file:

1. **Ownership columns reference `auth.users`, not `customers`.** Guest carts and
   guest checkout (§5.3, §5.4) run on Supabase anonymous sessions, which have an
   `auth.uid()` but no profile. `customers` is a profile table for registered
   accounts; ownership everywhere else is `auth.uid()`, which keeps every RLS
   policy to a single cheap comparison.

2. **`orders` carries extra columns.** `contact_email`, `contact_phone` and a
   `shipping_*` address snapshot. §6's column list has no address reference, but
   an order with no delivery address cannot be fulfilled. The snapshot is
   intentionally not a foreign key to `addresses`, so editing a saved address
   never rewrites where a past parcel actually went.

## Not yet created

- **Storage buckets** for product and editorial imagery (§2), plus their access
  policies.
- **Seed data.** No products, categories or size-chart rows exist. `categories`
  must be seeded with slugs matching `src/config/routes.ts` (`knitwear`,
  `shirts`, `trousers`) before `/shop/:category` resolves.
- **Edge Functions** for Razorpay and the Style Assistant.
