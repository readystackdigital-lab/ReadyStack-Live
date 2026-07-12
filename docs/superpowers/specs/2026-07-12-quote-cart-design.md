# Quote-Request Cart + Service Bundles — Design Spec

Date: 2026-07-12
Status: Approved by owner (conversation 2026-07-12)

## Goal

Let visitors build a cart of ReadyStack services and add-ons from anywhere on the
site, see indicative totals, and submit the selection as a quote request. No online
payment now, but the architecture must make a future Stripe Checkout swap trivial.

## Decisions (owner-approved)

1. **Cart outcome:** quote-request only. Submits to the existing enquiry endpoint
   (`https://agent.readystackdigital.com/estimate`-style pipeline). No payment.
2. **Relationship to /estimate:** the cart complements the existing Project Scoper.
   `/estimate` and `CostCalculator.astro` are untouched.
3. **Bundles:** yes, with a visible indicative saving (~10% off upfront components;
   monthly fees never discounted).
4. **Approach:** vanilla TS + localStorage store. No new dependencies, matching the
   site's zero-framework architecture.

## Stripe-readiness rules (bake in now)

- Every sellable item has a **stable string id** (already true in `pricing.ts`);
  these map 1:1 to Stripe Price IDs later.
- Upfront (`price`) and recurring (`monthly`) amounts stay **separate numeric
  fields** end to end (Stripe one-time vs recurring line items).
- All submission flows through **one `submitCart()` function** in `cart.ts`;
  future Stripe = replace that function's target with a
  create-Checkout-Session endpoint.
- The cart stores **ids only, never prices**. Prices are always resolved from
  `pricing.ts` at render/submit time, so pricing edits cannot go stale in a
  visitor's saved cart.

## Data model

Extend `src/data/pricing.ts` (remains the single source of truth):

```ts
export type Bundle = {
  id: string;
  name: string;
  tagline: string;
  includes: string[];      // ids of pages/addons/care entries
  upfront: number;         // discounted bundle "from" price
  monthly: number;         // sum of member monthlies, undiscounted
  saving: number;          // itemised upfront minus bundle upfront
};
export const BUNDLES: Bundle[] = [ /* three bundles below */ ];
```

### Bundles

| id | Name | Includes | Upfront (from) | Monthly | Saving |
|----|------|----------|----------------|---------|--------|
| `launch` | Launch Ready | landing + seo + care | $1,300 | $100/mo | $150 |
| `growth-engine` | Growth Engine | business + seo + blog + care | $2,475 | $100/mo | $275 |
| `ai-front-desk` | AI Front Desk | business + seo + booking + ai + careplus | $3,735 | $299/mo | $415 |

Itemised references: landing from $1,000, business (up to 5 pages) from $1,900,
seo $450, blog $400, booking $300, ai $1,500 + $149/mo, care $100/mo,
careplus $150/mo.

## Cart store — `src/scripts/cart.ts`

- Storage: localStorage key `rsd-cart`, JSON `{ v: 1, items: CartItem[] }` where
  `CartItem = { id: string, type: 'page' | 'addon' | 'care' | 'bundle' }`.
- In-memory fallback when localStorage throws (private mode / blocked).
- API: `getItems()`, `add(item)`, `remove(id)`, `clear()`, `totals()`,
  `submitCart(contact)`. Mutations dispatch `document` CustomEvent `cart:change`.
- Rules enforced in `add()`:
  - Max one `page` tier and one `care` plan; adding another replaces it.
  - Add-ons toggle (add twice = still one).
  - A bundle is **one line item**; adding it removes any individual items whose
    ids are inside the bundle, and removes any other bundle.
  - Consult-only items (`custom` tier, `ecom`) are valid items with no price;
    totals label them "custom quote".
- `totals()` returns `{ upfrontMin, upfrontMax, monthly, hasConsult }` computed
  from `pricing.ts` + `BUNDLES`.

## UI

### Header (`Header.astro`)
Cart icon button with count badge; badge hidden at zero. Clicking opens the
drawer. Fits the existing trimmed nav and both themes.

### Cart drawer (`src/components/CartDrawer.astro`)
Mounted once in `BaseLayout.astro`. Slide-in right panel, scoped CSS, motion
consistent with site conventions, dark-theme aware, focus-trapped, Esc closes.
Contents top to bottom:
1. Line items: name, price ("from $X" / "$X/mo" / "Custom quote"; bundles list
   their contents and show "Save $X"), remove button.
2. Totals: "Upfront (indicative)" range and "Monthly" separately; note when
   custom-quote items are present.
3. Disclaimer: indicative pricing, clear fixed quote before any work begins.
4. Contact form: name, email, phone (optional), message (optional), honeypot
   (same pattern as CostCalculator).
5. "Request my quote" button; success state clears cart and confirms; failure
   shows inline error plus a prefilled WhatsApp fallback link containing the
   itemised summary.

### Add-to-cart entry points
- `/services`: add button per service/add-on card.
- `/packages`: plan cards get "Add to cart" as the primary action with
  "or talk to us" secondary link to /contact; new "Bundles" section renders the
  three bundles with contents, price, saving badge, and one-click add.
- `/estimate`: unchanged.

## Submission

POST JSON to the Scoper's existing `ENDPOINT`
(`https://agent.readystackdigital.com/estimate`) with `source: 'cart'` as the
discriminator, so no server-side change is required:

```json
{ "source": "cart", "items": [...resolved with labels + prices...],
  "totals": {...}, "contact": { "name", "email", "phone", "message" } }
```

Honeypot filled ⇒ silently drop. Network/HTTP failure ⇒ error state + WhatsApp
fallback (number reused from CostCalculator).

## Error handling summary

- localStorage unavailable → in-memory cart, everything still works per page.
- Corrupt stored JSON → reset to empty cart.
- Stale ids in a saved cart (pricing renamed later) → silently dropped on load.
- Endpoint failure → inline error + WhatsApp fallback.

## Out of scope

- Any payment processing, Stripe keys, or serverless functions.
- Changes to CostCalculator / /estimate.
- Quantity > 1 per item (services are one-off engagements).
- Accounts, saved carts across devices.

## Verification

No automated test infra in this repo. Verify by:
1. `npx astro check` and `npx astro build` pass.
2. Preview-browser walkthrough: add from /services and /packages, badge counts,
   refresh persistence, tier/care replacement, bundle conflict replacement,
   remove/clear, totals math vs pricing.ts, drawer a11y (Esc, focus), both
   themes, mobile viewport, submit success and failure paths.

## Revision 1 (2026-07-13, owner-approved)

1. **Bundles removed entirely.** Delete the /packages bundles section, `BUNDLES`
   from pricing.ts, the `bundle` cart item type and all bundle logic/tests, and
   the drawer's bundle rendering. The cart carries individual items only.
2. **Site-wide repricing, no price ends in 0:**
   - Pages: landing 799–1,199 · business 1,799–2,499 · growth 2,799–3,799 · custom (consult)
   - Add-ons: booking 299 · blog 399 · seo 449 · ai 1,499 + 149/mo · ecom consult
   - Care: care 99/mo · careplus 149/mo
   Applied in pricing.ts AND every hardcoded occurrence: Hero.astro trust line,
   Pricing.astro (homepage), packages.astro (cards, hero sub, FAQs),
   services.astro (AI blurb), BaseLayout.astro (schema.org offers),
   CostCalculator.astro (initial bracket placeholder text only — the earlier
   "do not modify CostCalculator" constraint is amended to permit exactly this
   one text default; all its live math comes from pricing.ts automatically).
3. **Homepage packages section reframed** as three growth-stage cards telling
   the "we grow businesses, not just build websites" story:
   01 Get Online (landing build, from $799) → 02 Stay Managed & Grow (care from
   $99/mo, SEO/blog/social) → 03 Automate with AI (AI agent $1,499 + $149/mo,
   featured). Each card gets an add-to-cart button wired to the existing cart.
   Hero trust line and section copy updated to match. No em dashes in copy.
