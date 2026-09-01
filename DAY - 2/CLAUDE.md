# CLAUDE.md — Saints Crew: Full Project Blueprint

This is the single source of truth for this project. Read it completely before scaffolding, planning, or writing any code. This describes the complete product we are building — there is no phased "v1/v2" plan, this is the whole thing, built properly, once.

---
DON'T PUSH ANYTHING TO GITHUB WITHOUT MY PERMISSION 
## 1. What We Are Building

Saints Crew is a direct-to-consumer Indian menswear e-commerce brand selling knitwear, shirts, and trousers. We are building a real, fully working online store from scratch — not a template, not a demo, not placeholder content anywhere.

**The core problem we solve:** men shopping for clothes online can't tell fit and fabric quality from photos alone, and most small independent brand sites offer zero real guidance — just a product grid and a size chart nobody trusts. That uncertainty is why people default to big marketplaces instead of buying from an independent brand.

**Our answer:** a store where every product page gives real fit/fabric information, backed by a Style Assistant — a short, guided conversational flow that asks a handful of simple questions (occasion, fit preference, size, budget) and returns specific product recommendations with a plain-language reason for each. Not a generic AI chatbot bolted on for show — a focused tool that directly removes purchase hesitation.

**Target user:** urban Indian men, roughly 20–35, buying smart-casual basics online. Price-conscious but quality-aware. Comfortable buying online but cautious about fit from unfamiliar brands.

---

## 2. Tech Stack (fixed — do not introduce anything outside this list without asking)

- **Frontend framework:** React (plain React via **Vite**, not Next.js, not any meta-framework). Client-side rendered SPA.
- **Routing:** React Router (v6+)
- **Styling:** Tailwind CSS. Component primitives via shadcn/ui (these are copy-in React components, not a separate framework — compatible with plain Vite+React).
- **State management:** React Context + hooks for global state (cart, auth session, wishlist). Do not add Redux/Zustand/Recoil — the app is not complex enough to justify it.
- **Backend/Database/Auth/Storage:** **Supabase only.**
  - Supabase Postgres — all product, order, customer, and content data
  - Supabase Auth — customer accounts (email/password + optionally Google OAuth)
  - Supabase Storage — product images, lookbook/editorial images
  - Supabase Row Level Security (RLS) — enforced on every table holding customer or order data
  - Supabase Edge Functions — used for anything that needs a server-side secret (Razorpay order creation/verification, the Style Assistant's call to the Anthropic API). The React app never calls these third-party APIs directly with a secret key.
- **Payments:** Razorpay (UPI, cards, netbanking — India-first)
- **Style Assistant backend:** Supabase Edge Function calling the Anthropic API with a fixed, structured prompt — output constrained to a JSON list of recommended product IDs + one-line reasons, matched against real Supabase product data. This is not a freeform chatbot; the UI presents it as a short guided conversation, but the underlying logic is deterministic and grounded in the actual catalog.
- **Hosting:** Static hosting for the Vite build (Vercel or Netlify — either is fine, no server runtime needed since Supabase handles the backend).

No CMS. No GraphQL layer. No microservices. Keep everything in one React codebase talking directly to Supabase.

---

## 3. UI Vibe & Design System

The site must feel **confident, quiet-premium menswear** — like a small, serious brand that knows exactly what it sells. Not a marketplace. Not loud streetwear/hype aesthetics. Not a generic Shopify-default look.

### Color Palette
- **Background (primary):** near-black, `#101012` — used for hero sections and dark UI blocks, not pure `#000000` (too harsh/cheap-looking).
- **Background (secondary/light sections):** warm off-white, `#F6F2EC` — used for content sections, product grids, forms. Avoid pure white `#FFFFFF`, it reads cold and cheap next to the near-black.
- **Text on dark:** warm off-white `#F6F2EC`
- **Text on light:** near-black `#181816`
- **Accent (primary):** deep clay/rust, `#A85C3B` — used sparingly: CTA buttons, active states, price highlights, Style Assistant entry point. This is the one color that should stand out; don't overuse it.
- **Muted/neutral:** warm stone gray, `#8C8579` — used for secondary text, borders, disabled states.
- **Success/error:** keep desaturated — muted forest green `#4C6B4F` for success, muted brick red `#9C4B41` for errors. Never bright saturated red/green; they clash with the palette.

### Typography
- **Headings:** a serif with character — Fraunces or Playfair Display. This is what gives the brand an editorial, considered feel rather than a generic sans-everything look.
- **Body/UI text:** a clean grotesque sans — Inter or Neue Montreal. Used for all body copy, buttons, form labels, nav.
- **Scale:** generous. Hero headline large and confident (48–72px desktop), clear hierarchy drop between H1/H2/H3/body — avoid cramming multiple similar font sizes together.
- **Letter-spacing:** slightly loosened uppercase tracking for nav items, category labels, and small eyebrow text (e.g., "NEW ARRIVAL", "STYLE ASSISTANT") — reinforces the editorial feel.

### Spacing & Layout
- Generous whitespace throughout — this is a quiet-premium brand, not a dense marketplace grid. Err on the side of more breathing room, especially around hero sections and product imagery.
- Consistent spacing scale (Tailwind's default 4px-based scale is fine — use it consistently, don't invent arbitrary pixel values).
- Max content width around 1280–1440px on desktop; never let text lines stretch full-bleed on wide screens.

### Imagery
- Editorial-style photography — moody, natural light, muted tones matching the palette above. Avoid harsh studio white-background product shots as the primary hero style (fine for a supplementary flat-lay/detail shot on PDP, not for hero/homepage).
- Every product must have multiple images: full look, fabric close-up, and a fit-on-body shot at minimum.

### Components & Interaction
- Buttons: solid clay-accent fill for primary actions (Add to Bag, Checkout), outlined/ghost style for secondary actions. Fully rounded corners are too playful for this brand — use small border-radius (4–8px), not pill-shaped buttons.
- Cards (product cards): image-forward, minimal text below (name, price, 1–2 word category tag). No cluttered badges/ribbons unless it's a genuine sale.
- Transitions: subtle and fast (150–250ms ease) — fade/slide on modal open, smooth hover scale (subtle, ~1.02x) on product images. Nothing bouncy or playful; motion should feel precise, not fun.
- Forms: minimal fields, clear inline validation, no unnecessary required fields (especially at checkout).

The test for every screen: does this look like a small, confident, independent menswear label — or does it look like a stock e-commerce template? If it's the latter, redo it.

---

## 4. Site Map / Information Architecture

- `/` — Homepage
- `/shop` — Full catalog with filters
- `/shop/knitwear`, `/shop/shirts`, `/shop/trousers` — Category views (filtered `/shop`)
- `/product/:slug` — Product detail page
- `/style-assistant` — Guided style/fit assistant (also accessible as a persistent entry point, e.g. floating button, from anywhere on the site)
- `/size-guide` — Size guide (also linked contextually from PDP and the Style Assistant)
- `/cart` — Cart
- `/checkout` — Checkout flow
- `/order-confirmation/:orderId` — Order confirmation
- `/account` — Customer account (order history, saved addresses, wishlist)
- `/wishlist` — Saved items (also viewable inside `/account`)
- `/about` — Brand story
- `/shipping-returns` — Shipping & Returns policy
- `/privacy-policy` — Privacy Policy
- `/terms` — Terms & Conditions
- `/contact` — Contact page (real email, phone/WhatsApp link, not placeholders)

Persistent header: logo, nav (Shop ▾ with category dropdown, Style Assistant, About), search icon, wishlist icon, cart icon, account icon. Persistent footer: About/story blurb, policy links, social links (Instagram, WhatsApp — pointing to actual brand handles, consistently, everywhere), newsletter signup, real contact info.

---

## 5. Full Feature List (in detail)

### 5.1 Product Catalog & Category Browsing
- Full product grid at `/shop`, filterable by category (Knitwear/Shirts/Trousers), size, color, and price range.
- Sort options: Newest, Price (low–high, high–low).
- Each category has its own dedicated view (not just a filter state hidden in a query param that's easy to lose) — `/shop/shirts` etc. should be a real, shareable, bookmarkable URL.
- Empty states matter: if a filter combination returns nothing, show a clear message and a way to reset filters — never show a blank grid with no explanation.
- Product cards show: primary image (hover to secondary image), name, price, and available sizes at a glance (or "Sold out" state).

### 5.2 Product Detail Page (PDP)
- Image gallery: minimum 3 images (full look, fabric close-up, fit-on-body), swipeable on mobile, thumbnail strip on desktop.
- Product name, price, short description.
- **Fabric & fit information** — explicit section, not buried: fabric composition, fit type (slim/regular/relaxed), care instructions.
- Size selector with real-time stock awareness (disable/gray out sizes that are out of stock, don't just let someone select something unavailable).
- Direct link to Size Guide from the size selector itself ("Not sure of your size? →").
- Direct entry point to Style Assistant from PDP ("Not sure this is right for you? Ask the Style Assistant") — this cross-links the USP feature contextually instead of only living on its own page.
- Add to Bag and Add to Wishlist actions, both clearly available without scrolling on mobile.
- Related/complementary products section at the bottom (e.g., trousers that pair with a shown shirt) — real pairing logic based on category/tag, not random.

### 5.3 Cart
- Persistent across session (stored server-side against the Supabase user session for logged-in users; local state + Supabase anonymous session for guests).
- Quantity adjustment, remove item, clear visible subtotal.
- Shows estimated shipping status (e.g., progress toward free shipping threshold) — accurate and consistent site-wide (the old site had a ₹600 vs ₹6000 mismatch; this must never happen — the threshold should live in exactly one place in the database/config, referenced everywhere it's displayed).
- Clear path to Checkout; cart should also be viewable/editable as a slide-out drawer from anywhere on the site, not just its own page.

### 5.4 Checkout
- Guest checkout by default — never force account creation to buy.
- Minimal required fields: name, phone, delivery address (with pincode-based auto-suggestion if feasible), email (for order confirmation).
- Razorpay integration for payment (UPI, cards, netbanking) — order created via a Supabase Edge Function (never expose Razorpay secret keys client-side), payment verified server-side before marking an order as paid.
- Clear order summary visible throughout checkout (items, sizes, subtotal, shipping, total) — no surprise costs at the final step.
- Address save option for logged-in users (stored in Supabase, reusable on future orders).

### 5.5 Order Confirmation & Order History
- Confirmation page after successful payment: order number, items, delivery estimate, and what happens next.
- Order confirmation email (can be triggered via Supabase Edge Function + an email provider, or deferred to a simple transactional email service — flag this as a build decision to confirm, not something to skip silently).
- Logged-in users can view full order history and current order status under `/account`.

### 5.6 Style Assistant (the core USP — build this carefully)
- Entry points: persistent nav item, homepage hero CTA, contextual link from PDP.
- Flow: a short, guided, multi-step conversational UI (not a freeform open text chat box) asking:
  1. What are you shopping for? (Shirt / Knitwear / Trousers / Not sure — surprise me)
  2. What's the occasion? (Everyday / Office / Evening out / Layering piece)
  3. Fit preference? (Slim / Regular / Relaxed)
  4. Do you know your size? If yes, select it. If no, route into the Size Finder sub-flow (see 5.7).
  5. Budget range (optional, with a skip option).
- On submit: the answers are sent to a Supabase Edge Function, which calls the Anthropic API with a prompt constrained to the actual product catalog data (fetched from Supabase first), and returns a small, structured set of recommended product IDs plus a one-line reason for each — not open-ended prose, not a chat the user has to keep steering.
- Results screen: shows 3–5 recommended products as normal product cards (image, name, price) with the one-line reason displayed beneath each ("Relaxed fit, breathable knit — good for everyday wear in your size").
- User can restart the flow or refine an answer (e.g., change occasion) without starting completely over.
- Every Style Assistant session is logged (see schema) so we can see what people are actually asking for — this data matters for future catalog decisions even though we're not building analytics dashboards now.

### 5.7 Size Finder
- Short standalone quiz (also reachable from the Style Assistant's "I don't know my size" branch, and directly from the Size Guide page): height, usual size in a reference brand (dropdown of common Indian/international brands if feasible, otherwise a simple chest/waist measurement input), fit preference.
- Outputs a recommended size mapped against the real Saints Crew size chart (stored in Supabase, not hardcoded in the frontend, so it can be corrected without a redeploy).

### 5.8 Wishlist
- Available to logged-in users. Heart/save icon on product cards and PDP.
- Dedicated `/wishlist` view, also visible inside `/account`.
- Saved items should show current stock/size availability, not just a static saved list.

### 5.9 Account
- Supabase Auth (email/password, optionally Google OAuth).
- Account dashboard: order history, saved addresses, wishlist, basic profile info (name, email, phone).
- Password reset via Supabase Auth's built-in flow.

### 5.10 Content Pages (About, Shipping & Returns, Size Guide, Privacy Policy, Terms & Conditions, Contact)
- All content must be real, final copy — no lorem ipsum, no leftover template text from any source, ever. If final copy isn't available yet, leave an explicit `{{TODO: copy needed — [topic]}}` placeholder that's visually obvious in a CMS/editing context, never something that could pass as real content if accidentally shipped.
- About page: genuine brand story — who Saints Crew is, what it stands for, what makes the product different (fabric sourcing, fit philosophy, whatever is actually true).
- Contact page: real email, real phone number, working WhatsApp link (not a bare `wa.me` with no number, and not linking to the generic WhatsApp homepage).

### 5.11 Newsletter Signup
- Present in the footer (site-wide) and as a homepage section.
- Must include a stated incentive line (e.g., "Get 10% off your first order" or "First access to new drops") — never a bare email field with no reason to submit.
- Stored in a Supabase table; if a discount code is promised, that logic needs to actually exist (auto-generated code, or manual — decide and implement, don't promise something the system can't deliver).

### 5.12 Social & Contact Consistency
- Every instance of Instagram/WhatsApp/social links across the entire site (header, footer, contact page) must point to the same real, correct destination. This was a specific failure in the previous version (footer links pointed to generic platform homepages while the header pointed to the real handle) — treat this as a single source of truth problem: store the actual handles/links in one config location and reference them everywhere, never hardcode them in multiple places.

---

## 6. Database Schema (Supabase Postgres)

- `products` — id, name, slug, category_id, description, fabric, fit_type, care_instructions, price, is_active, created_at
- `categories` — id, name, slug
- `product_variants` — id, product_id, size, color, stock_qty, sku
- `product_images` — id, product_id, url, position, alt_text
- `size_chart` — id, category_id, size_label, measurements (jsonb: chest/waist/length etc.)
- `customers` — id (linked to `auth.users`), name, phone
- `addresses` — id, customer_id, line1, city, state, pincode, phone, is_default
- `carts` — id, customer_id (nullable for guest/session-based), created_at
- `cart_items` — id, cart_id, product_variant_id, qty
- `orders` — id, customer_id (nullable for guest), status, subtotal, shipping_fee, total, razorpay_order_id, razorpay_payment_id, created_at
- `order_items` — id, order_id, product_variant_id, qty, price_at_purchase
- `wishlists` — id, customer_id
- `wishlist_items` — id, wishlist_id, product_id
- `style_assistant_sessions` — id, customer_id (nullable), answers (jsonb), recommended_product_ids (array), created_at
- `newsletter_subscribers` — id, email, subscribed_at, discount_code (nullable)
- `site_config` — a single-row (or key/value) table holding things like the free-shipping threshold, so it's never hardcoded in more than one place.

Row Level Security must be enabled on every table containing customer, order, cart, or wishlist data — customers can only read/write their own rows; product/category/size_chart data is public-read.

---

## 7. Non-Functional Requirements

- **Responsiveness:** fully responsive, mobile-first — this is India, most traffic will be mobile. Every feature above must work cleanly on a small screen before desktop polish is considered done.
- **Performance:** optimize product images (served via Supabase Storage with appropriate sizing/compression), lazy-load below-the-fold images, keep the Vite bundle lean — no unnecessary heavy libraries.
- **Accessibility:** real alt text on all product images, sufficient color contrast (double-check the clay accent `#A85C3B` against both backgrounds meets contrast requirements for text use, use it mainly for large elements/buttons rather than small body text), keyboard-navigable forms and modals.
- **SEO:** since this is a client-rendered Vite SPA, ensure meta tags are set per-route (via a helper like `react-helmet-async`), product pages have descriptive titles/descriptions, and consider pre-rendering key pages if organic search traffic matters — flag this as a decision point rather than assuming it away.

---

## 8. Content Integrity Rule (non-negotiable)

No placeholder, template, or lorem-ipsum content is ever committed to this project — this was the exact failure of the previous version (fake contact info, an unrelated brand's "About" story, mismatched pricing numbers left unresolved). Every piece of copy, every contact detail, every number shown to a user must be real or explicitly marked as a pending TODO that cannot be mistaken for real content.

---

## 9. Explicitly Out of Scope

Loyalty/points programs, gamification, AR try-on, multi-language support, an open-ended freeform AI chatbot with memory, a full custom admin dashboard beyond direct Supabase table management, social login providers beyond Google (unless requested). Do not add any of these without an explicit request — the brand's whole positioning is quiet-premium and focused, not feature-bloated.

## 10. Working Style For This Project

- Plan before building. For any non-trivial feature, outline the approach and confirm before writing code.
- Every feature must map back to something in Section 5 — do not add scope silently.
- Prefer fewer, well-executed features over more, shallow ones — this mirrors the brand's own positioning.
- Flag anything drifting toward unnecessary complexity immediately.