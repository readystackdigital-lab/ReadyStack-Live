# Quote-Request Cart + Bundles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Dispatch implementation subagents on the **sonnet** model.

**Goal:** Site-wide quote-request cart: visitors add services, add-ons and bundles from /services and /packages, review indicative totals in a slide-in drawer, and submit as an enquiry to the existing agent endpoint.

**Architecture:** Pure cart rules live in `src/scripts/cart-core.ts` (unit-tested with Node's built-in test runner, zero new deps). A thin browser store `src/scripts/cart.ts` adds localStorage persistence, `cart:change` events and `submitCart()`. UI is one `CartDrawer.astro` mounted in `BaseLayout.astro` that also wires all `[data-cart-add]` buttons via document-level event delegation, so pages need markup only, no scripts.

**Tech Stack:** Astro 6, vanilla TypeScript, scoped CSS with existing site custom properties, Node 26 `node --test` for unit tests.

**Spec:** `docs/superpowers/specs/2026-07-12-quote-cart-design.md` (approved).

## Global Constraints

- No new npm dependencies. No framework islands.
- `src/data/pricing.ts` stays the single source of truth; the cart stores ids only, never prices.
- Stripe-readiness: stable string ids; `price` (upfront) and `monthly` stay separate numeric fields; all submission through the single `submitCart()`.
- Never use em dashes in any site copy (owner rule). Use commas, periods, or "plus".
- `/estimate` and `CostCalculator.astro` must not be modified.
- Currency formatting: `'$' + n.toLocaleString('en-AU')` (matches CostCalculator).
- Endpoint: `https://agent.readystackdigital.com/estimate` with `source: 'cart'`; honeypot field name `company_website`; on honeypot fill, silently show success.
- Styling: reuse existing utility classes (`btn`, `btn-amber`, `btn-outline`, `btn-full`, `section`, `container`, `eyebrow`, `section-h2`, `reveal`) and CSS custom properties (`--white`, `--charcoal-*`, `--amber*`, `--space-*`, `--radius-*`, `--text-*`, `--font-*`, `--shadow-*`, `--dur-base`, `--ease-out`). Both themes must work (vars are theme-swapped in `public/css/theme.css`; never hardcode surface colors except amber accents already used site-wide, e.g. `#F59E0B`).
- Type check: `npx astro check`. Unit tests: `node --test tests/`. Build: `npx astro build`.
- Commit after each task with the message given in the task.

## File Structure

- `src/data/pricing.ts` (modify): export `Entry`, add `Bundle` type + `BUNDLES`.
- `src/scripts/cart-core.ts` (create): pure cart logic. No DOM, no storage.
- `tests/cart-core.test.ts` (create): node:test unit tests.
- `src/scripts/cart.ts` (create): storage + events + submit. Browser-only.
- `src/components/CartDrawer.astro` (create): drawer UI + all cart wiring.
- `src/components/Header.astro` (modify): cart button + badge in `.nav-actions`.
- `src/layouts/BaseLayout.astro` (modify): mount `<CartDrawer />`.
- `src/pages/packages.astro` (modify): add-to-cart on plan cards + new Bundles section.
- `src/pages/services.astro` (modify): tier chips on the Build card, add buttons on Email/SEO/Care/AI cards.
- `tsconfig.json` (modify): `allowImportingTsExtensions` (imports use explicit `.ts` so Node can run tests directly).

---

### Task 1: Bundle data in pricing.ts + tsconfig

**Files:**
- Modify: `src/data/pricing.ts`
- Modify: `tsconfig.json`

**Interfaces:**
- Produces: `export type Entry`, `export type Bundle`, `export const BUNDLES: Bundle[]`. Later tasks import `{ PRICING, BUNDLES, type Bundle, type Entry }` from `../data/pricing.ts`.

- [ ] **Step 1: Export `Entry` and append `Bundle` + `BUNDLES` to `src/data/pricing.ts`**

Change line 7 `type Entry = {` to `export type Entry = {`. Then append after the `pricingSummary` function:

```ts
/* ── Bundles ─────────────────────────────────────────────────
   Curated packages with an indicative saving on the upfront
   components. Monthly fees are never discounted. `includes`
   holds ids from PRICING.pages / addons / care.             */

export type Bundle = {
  id: string;
  name: string;
  tagline: string;
  includes: string[];
  upfront: number;
  monthly: number;
  saving: number;
};

export const BUNDLES: Bundle[] = [
  {
    id: 'launch',
    name: 'Launch Ready',
    tagline: 'Get online fast: a landing page with SEO and monthly care.',
    includes: ['landing', 'seo', 'care'],
    upfront: 1300,
    monthly: 100,
    saving: 150,
  },
  {
    id: 'growth-engine',
    name: 'Growth Engine',
    tagline: 'A full small-business site with SEO, a blog and monthly care.',
    includes: ['business', 'seo', 'blog', 'care'],
    upfront: 2475,
    monthly: 100,
    saving: 275,
  },
  {
    id: 'ai-front-desk',
    name: 'AI Front Desk',
    tagline: 'A full site with booking, a 24/7 AI receptionist and priority care.',
    includes: ['business', 'seo', 'booking', 'ai', 'careplus'],
    upfront: 3735,
    monthly: 299,
    saving: 415,
  },
];
```

- [ ] **Step 2: Allow `.ts` import extensions in `tsconfig.json`**

Replace the whole file with:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 3: Verify types**

Run: `npx astro check`
Expected: 0 errors (warnings/hints acceptable if they pre-exist).

- [ ] **Step 4: Commit**

```bash
git add src/data/pricing.ts tsconfig.json
git commit -m "feat: add service bundles to pricing data"
```

---

### Task 2: cart-core.ts pure logic (TDD)

**Files:**
- Create: `src/scripts/cart-core.ts`
- Test: `tests/cart-core.test.ts`

**Interfaces:**
- Consumes: `PRICING`, `BUNDLES`, `Entry`, `Bundle` from `../data/pricing.ts` (Task 1).
- Produces (used by Tasks 3 and 4):
  - `type CartItemType = 'page' | 'addon' | 'care' | 'bundle'`
  - `type CartItem = { id: string; type: CartItemType }`
  - `type ResolvedItem = { id: string; type: CartItemType; label: string; priceText: string; monthlyText: string | null; saving: number | null; includes: string[] }`
  - `type CartTotals = { upfrontMin: number; upfrontMax: number; monthly: number; hasConsult: boolean; count: number }`
  - `addItem(items: CartItem[], item: CartItem): CartItem[]`
  - `removeItem(items: CartItem[], id: string): CartItem[]`
  - `sanitize(raw: unknown): CartItem[]`
  - `resolveItems(items: CartItem[]): ResolvedItem[]`
  - `totals(items: CartItem[]): CartTotals`
  - `money(n: number): string`

**Cart rules (what the tests assert):**
- Adding a `page` removes any other `page` item and any `bundle` (every bundle contains a page tier).
- Adding a `care` removes any other `care` item and any `bundle`.
- Adding an `addon` is idempotent; if a bundle in the cart already includes that addon id, adding is a no-op.
- Adding a `bundle` removes: other bundles, all `page` items, all `care` items, and any individual item whose id is in the bundle's `includes`. Non-member addons survive.
- Unknown ids are rejected by `addItem` and stripped by `sanitize`.

- [ ] **Step 1: Write the failing test file `tests/cart-core.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRICING, BUNDLES } from '../src/data/pricing.ts';
import {
  addItem, removeItem, sanitize, resolveItems, totals,
  type CartItem,
} from '../src/scripts/cart-core.ts';

const page = (id: string): CartItem => ({ id, type: 'page' });
const addon = (id: string): CartItem => ({ id, type: 'addon' });
const care = (id: string): CartItem => ({ id, type: 'care' });
const bundle = (id: string): CartItem => ({ id, type: 'bundle' });

test('adding a second page tier replaces the first', () => {
  const items = addItem(addItem([], page('landing')), page('business'));
  assert.deepEqual(items, [page('business')]);
});

test('adding a second care plan replaces the first', () => {
  const items = addItem(addItem([], care('care')), care('careplus'));
  assert.deepEqual(items, [care('careplus')]);
});

test('addon add is idempotent', () => {
  const items = addItem(addItem([], addon('seo')), addon('seo'));
  assert.equal(items.length, 1);
});

test('unknown ids are rejected', () => {
  assert.deepEqual(addItem([], addon('nope')), []);
  assert.deepEqual(addItem([], { id: 'seo', type: 'bundle' }), []);
});

test('bundle removes members, other bundles, page and care; keeps non-member addons', () => {
  let items: CartItem[] = [page('landing'), addon('seo'), addon('ai'), care('careplus'), bundle('launch')];
  items = addItem(items.slice(0, 4), bundle('launch')); // launch includes landing, seo, care
  assert.deepEqual(items, [addon('ai'), bundle('launch')]);
  items = addItem(items, bundle('growth-engine'));
  assert.deepEqual(items, [addon('ai'), bundle('growth-engine')]);
});

test('adding a page or care after a bundle replaces the bundle', () => {
  assert.deepEqual(addItem([bundle('launch')], page('growth')), [page('growth')]);
  assert.deepEqual(addItem([bundle('launch')], care('care')), [care('care')]);
});

test('addon already covered by a bundle is a no-op', () => {
  const items = [bundle('launch')]; // includes seo
  assert.deepEqual(addItem(items, addon('seo')), items);
});

test('removeItem removes by id', () => {
  assert.deepEqual(removeItem([addon('seo'), addon('blog')], 'seo'), [addon('blog')]);
});

test('sanitize drops junk, unknown ids and duplicates', () => {
  const raw = [addon('seo'), addon('seo'), { id: 'zzz', type: 'addon' }, 'junk', null, { id: 'care' }];
  assert.deepEqual(sanitize(raw), [addon('seo')]);
  assert.deepEqual(sanitize('not an array'), []);
});

test('totals: landing + seo + care', () => {
  const t = totals([page('landing'), addon('seo'), care('care')]);
  assert.equal(t.upfrontMin, 1450);
  assert.equal(t.upfrontMax, 1850);
  assert.equal(t.monthly, 100);
  assert.equal(t.hasConsult, false);
  assert.equal(t.count, 3);
});

test('totals: consult items flag but add nothing', () => {
  const t = totals([page('custom'), addon('ecom')]);
  assert.equal(t.upfrontMin, 0);
  assert.equal(t.hasConsult, true);
});

test('totals: bundle uses bundle upfront and monthly', () => {
  const t = totals([bundle('ai-front-desk')]);
  assert.equal(t.upfrontMin, 3735);
  assert.equal(t.upfrontMax, 3735);
  assert.equal(t.monthly, 299);
});

test('every bundle: saving and monthly are consistent with member pricing', () => {
  const find = (id: string) =>
    [...PRICING.pages, ...PRICING.addons, ...PRICING.care].find((e) => e.id === id)!;
  for (const b of BUNDLES) {
    let upfront = 0, monthly = 0;
    for (const id of b.includes) {
      const e = find(id);
      assert.ok(e, `bundle ${b.id} references unknown id ${id}`);
      if (typeof e.min === 'number') upfront += e.min;
      if (typeof e.price === 'number') upfront += e.price;
      if (typeof e.monthly === 'number') monthly += e.monthly;
    }
    assert.equal(b.upfront + b.saving, upfront, `bundle ${b.id} saving math`);
    assert.equal(b.monthly, monthly, `bundle ${b.id} monthly sum`);
  }
});

test('resolveItems formats bundles with contents and saving', () => {
  const [r] = resolveItems([bundle('launch')]);
  assert.equal(r.label, 'Launch Ready');
  assert.equal(r.priceText, 'from $1,300');
  assert.equal(r.monthlyText, '$100/mo');
  assert.equal(r.saving, 150);
  assert.ok(r.includes.includes('SEO setup'));
});

test('resolveItems formats page, addon, consult and flagOnly', () => {
  const rs = resolveItems([page('landing'), addon('seo'), addon('ecom'), addon('email')]);
  assert.equal(rs[0].priceText, 'from $1,000–$1,400');
  assert.equal(rs[1].priceText, '+$450');
  assert.equal(rs[2].priceText, 'Custom quote');
  assert.equal(rs[3].priceText, 'Included in quote');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/`
Expected: FAIL (cannot find module `cart-core.ts`).

- [ ] **Step 3: Implement `src/scripts/cart-core.ts`**

```ts
/* ═══════════════════════════════════════════════════════════
   cart-core.ts — pure quote-cart rules. No DOM, no storage.
   The cart holds { id, type } only; every price is resolved
   from pricing.ts at call time so saved carts never go stale.
   Ids are stable and map 1:1 to future Stripe Price IDs.
═══════════════════════════════════════════════════════════ */

import { PRICING, BUNDLES, type Bundle, type Entry } from '../data/pricing.ts';

export type CartItemType = 'page' | 'addon' | 'care' | 'bundle';
export type CartItem = { id: string; type: CartItemType };

export type ResolvedItem = {
  id: string;
  type: CartItemType;
  label: string;
  priceText: string;
  monthlyText: string | null;
  saving: number | null;
  includes: string[];
};

export type CartTotals = {
  upfrontMin: number;
  upfrontMax: number;
  monthly: number;
  hasConsult: boolean;
  count: number;
};

const LISTS: Record<Exclude<CartItemType, 'bundle'>, Entry[]> = {
  page: PRICING.pages,
  addon: PRICING.addons,
  care: PRICING.care,
};

export const money = (n: number) => '$' + n.toLocaleString('en-AU');

function entryFor(item: CartItem): Entry | Bundle | undefined {
  if (item.type === 'bundle') return BUNDLES.find((b) => b.id === item.id);
  return LISTS[item.type]?.find((e) => e.id === item.id);
}

function labelFor(id: string): string {
  for (const list of Object.values(LISTS)) {
    const e = list.find((x) => x.id === id);
    if (e) return e.label;
  }
  return id;
}

export function addItem(items: CartItem[], item: CartItem): CartItem[] {
  const entry = entryFor(item);
  if (!entry) return items;

  let next = items.filter((i) => !(i.id === item.id && i.type === item.type));

  if (item.type === 'bundle') {
    const b = entry as Bundle;
    next = next.filter(
      (i) =>
        i.type !== 'bundle' &&
        i.type !== 'page' &&
        i.type !== 'care' &&
        !b.includes.includes(i.id)
    );
  } else if (item.type === 'page' || item.type === 'care') {
    next = next.filter((i) => i.type !== item.type && i.type !== 'bundle');
  } else {
    const covered = next.some(
      (i) => i.type === 'bundle' && (entryFor(i) as Bundle).includes.includes(item.id)
    );
    if (covered) return items;
  }
  return [...next, item];
}

export function removeItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((i) => i.id !== id);
}

export function sanitize(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CartItem[] = [];
  for (const it of raw) {
    if (!it || typeof it !== 'object') continue;
    const { id, type } = it as CartItem;
    if (typeof id !== 'string') continue;
    if (type !== 'page' && type !== 'addon' && type !== 'care' && type !== 'bundle') continue;
    if (!entryFor({ id, type })) continue;
    if (!out.some((o) => o.id === id && o.type === type)) out.push({ id, type });
  }
  return out;
}

export function resolveItems(items: CartItem[]): ResolvedItem[] {
  const out: ResolvedItem[] = [];
  for (const it of items) {
    const entry = entryFor(it);
    if (!entry) continue;
    if (it.type === 'bundle') {
      const b = entry as Bundle;
      out.push({
        id: b.id,
        type: it.type,
        label: b.name,
        priceText: 'from ' + money(b.upfront),
        monthlyText: b.monthly > 0 ? money(b.monthly) + '/mo' : null,
        saving: b.saving,
        includes: b.includes.map(labelFor),
      });
      continue;
    }
    const e = entry as Entry;
    const priceText = e.consult
      ? 'Custom quote'
      : e.flagOnly
        ? 'Included in quote'
        : it.type === 'page'
          ? 'from ' + money(e.min!) + '–' + money(e.max!)
          : typeof e.price === 'number'
            ? '+' + money(e.price)
            : '';
    out.push({
      id: e.id,
      type: it.type,
      label: e.label,
      priceText,
      monthlyText: typeof e.monthly === 'number' ? money(e.monthly) + '/mo' : null,
      saving: null,
      includes: [],
    });
  }
  return out;
}

export function totals(items: CartItem[]): CartTotals {
  let upfrontMin = 0;
  let upfrontMax = 0;
  let monthly = 0;
  let hasConsult = false;
  for (const it of items) {
    const entry = entryFor(it);
    if (!entry) continue;
    if (it.type === 'bundle') {
      const b = entry as Bundle;
      upfrontMin += b.upfront;
      upfrontMax += b.upfront;
      monthly += b.monthly;
      continue;
    }
    const e = entry as Entry;
    if (e.consult) {
      hasConsult = true;
      continue;
    }
    if (it.type === 'page') {
      upfrontMin += e.min!;
      upfrontMax += e.max!;
    }
    if (typeof e.price === 'number') {
      upfrontMin += e.price;
      upfrontMax += e.price;
    }
    if (typeof e.monthly === 'number') monthly += e.monthly;
  }
  return { upfrontMin, upfrontMax, monthly, hasConsult, count: items.length };
}
```

Note: the en dash in `'from $1,000–$1,400'` is a range dash inside a price, not an em dash; it matches CostCalculator's existing format.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/`
Expected: all tests PASS.

- [ ] **Step 5: Type check**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/scripts/cart-core.ts tests/cart-core.test.ts
git commit -m "feat: add pure cart rules with unit tests"
```

---

### Task 3: cart.ts browser store + submit

**Files:**
- Create: `src/scripts/cart.ts`

**Interfaces:**
- Consumes: everything from `./cart-core.ts` (Task 2).
- Produces (used by Task 4's drawer script):
  - `getItems(): CartItem[]`, `add(item: CartItem): void`, `remove(id: string): void`, `clear(): void`
  - `getResolved(): ResolvedItem[]`, `getTotals(): CartTotals`
  - `whatsAppLink(): string`
  - `type Contact = { name: string; email: string; phone?: string; message?: string; honeypot?: string }`
  - `submitCart(contact: Contact): Promise<void>` (throws on failure)
  - Mutations dispatch `document` CustomEvent `'cart:change'`.

- [ ] **Step 1: Implement `src/scripts/cart.ts`**

```ts
/* ═══════════════════════════════════════════════════════════
   cart.ts — browser quote-cart store. localStorage-backed
   (in-memory fallback), broadcasts 'cart:change' on document.
   FUTURE STRIPE: submitCart() is the single submission path.
   To take payments later, point it at a create-Checkout-Session
   endpoint; item ids map 1:1 to Stripe Price IDs.
═══════════════════════════════════════════════════════════ */

import {
  addItem, removeItem, sanitize, resolveItems, totals, money,
  type CartItem, type CartTotals, type ResolvedItem,
} from './cart-core.ts';

const KEY = 'rsd-cart';
// Same enquiry pipeline and WhatsApp line as CostCalculator.astro.
const ENDPOINT = 'https://agent.readystackdigital.com/estimate';
const WHATSAPP_NUMBER = '9779840318084';

let memoryItems: CartItem[] = [];
let storageOk = true;
try {
  localStorage.setItem(KEY + '-test', '1');
  localStorage.removeItem(KEY + '-test');
} catch {
  storageOk = false;
}

function load(): CartItem[] {
  if (!storageOk) return memoryItems;
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return [];
  }
}

function persist(items: CartItem[]): void {
  if (storageOk) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  } else {
    memoryItems = items;
  }
  document.dispatchEvent(new CustomEvent('cart:change', { detail: { items } }));
}

export function getItems(): CartItem[] { return load(); }
export function add(item: CartItem): void { persist(addItem(load(), item)); }
export function remove(id: string): void { persist(removeItem(load(), id)); }
export function clear(): void { persist([]); }
export function getResolved(): ResolvedItem[] { return resolveItems(load()); }
export function getTotals(): CartTotals { return totals(load()); }

export function whatsAppLink(): string {
  const lines = getResolved().map(
    (r) => r.label + (r.priceText ? ' (' + r.priceText + ')' : '')
  );
  const t = getTotals();
  let msg = 'Hi ReadyStack, I built a quote cart with: ' + lines.join('; ') + '.';
  if (t.upfrontMin > 0) {
    msg += ' Indicative upfront ' + money(t.upfrontMin) +
      (t.upfrontMax > t.upfrontMin ? '–' + money(t.upfrontMax) : '') + '.';
  }
  if (t.monthly > 0) msg += ' Plus ' + money(t.monthly) + '/mo ongoing.';
  msg += ' Can I get an exact quote?';
  return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
}

export type Contact = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  honeypot?: string;
};

export async function submitCart(contact: Contact): Promise<void> {
  const resolved = getResolved();
  const t = getTotals();
  const payload = {
    source: 'cart',
    name: contact.name,
    email: contact.email,
    phone: contact.phone || '',
    message: contact.message || '',
    company_website: contact.honeypot || '',
    items: resolved.map((r) => ({
      label: r.label + (r.includes.length ? ' (' + r.includes.join(', ') + ')' : ''),
      value: r.priceText || r.monthlyText || '',
    })),
    monthlyItems: resolved
      .filter((r) => r.monthlyText)
      .map((r) => ({ label: r.label, value: r.monthlyText })),
    bracket: t.upfrontMin > 0 ? money(t.upfrontMin) + ' – ' + money(t.upfrontMax) : null,
    consult: t.hasConsult,
    monthly: t.monthly > 0 ? money(t.monthly) : null,
    whatsappUrl: whatsAppLink(),
    timestamp: new Date().toISOString(),
    pageUrl: window.location.href,
  };
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('send failed');
}
```

- [ ] **Step 2: Type check**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/cart.ts
git commit -m "feat: add browser cart store with quote submission"
```

---

### Task 4: CartDrawer component, BaseLayout mount, Header cart button

**Files:**
- Create: `src/components/CartDrawer.astro`
- Modify: `src/layouts/BaseLayout.astro` (add import; render `<CartDrawer />` immediately after `<CookieConsent />`)
- Modify: `src/components/Header.astro` (cart button in `.nav-actions`, before the theme toggle at line 57)

**Interfaces:**
- Consumes: `src/scripts/cart.ts` (Task 3).
- Produces (relied on by Tasks 5 and 6): global click delegation so ANY element matching `button[data-cart-add][data-cart-type]` adds `{ id: dataset.cartAdd, type: dataset.cartType }` to the cart, flashes an "Added" state on the button, and opens the drawer. Any element matching `[data-cart-open]` opens the drawer. All `[data-cart-badge]` elements get the current count and `hidden` when zero.

- [ ] **Step 1: Add cart button to `Header.astro`**

In `.nav-actions`, directly before the theme-toggle button, insert:

```html
<button type="button" class="cart-open" data-cart-open aria-label="Open your quote cart">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 4h2l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.5a1.5 1.5 0 0 0 1.5-1.1L21 8H6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="20.5" r="1.4" fill="currentColor"/><circle cx="17" cy="20.5" r="1.4" fill="currentColor"/></svg>
  <span class="cart-badge" data-cart-badge hidden>0</span>
</button>
```

And add to Header's `<style>`:

```css
/* ── Quote cart button ─────────────────────────────────────── */
.cart-open {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background .22s ease, color .22s ease;
}
.cart-open:hover { background: rgba(245, 158, 11, 0.12); color: #B45309; }
.cart-badge {
  position: absolute;
  top: 1px;
  right: -1px;
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  border-radius: 999px;
  background: linear-gradient(135deg, #FCD34D, #F59E0B);
  color: #0B0D10;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  line-height: 15px;
  text-align: center;
}
```

- [ ] **Step 2: Create `src/components/CartDrawer.astro`**

```astro
---
/* ═══════════════════════════════════════════════════════════
   CartDrawer.astro — site-wide quote cart. Mounted once in
   BaseLayout. Owns all cart UI wiring: [data-cart-add] and
   [data-cart-open] delegation, badges, drawer, submission.
═══════════════════════════════════════════════════════════ */
---

<div class="cartd" id="cart-drawer" data-open="false">
  <div class="cartd-overlay" data-cart-close></div>
  <aside class="cartd-panel" role="dialog" aria-modal="true" aria-label="Your quote cart" tabindex="-1">
    <header class="cartd-head">
      <div>
        <div class="eyebrow">Quote cart</div>
        <h2 class="cartd-title">Your selection</h2>
      </div>
      <button type="button" class="cartd-close" data-cart-close aria-label="Close cart">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
      </button>
    </header>

    <div class="cartd-empty" data-role="empty">
      <p>Your cart is empty. Add services from the <a href="/services">services</a> or <a href="/packages">pricing</a> pages.</p>
    </div>

    <ul class="cartd-items" data-role="items" role="list"></ul>

    <div class="cartd-totals" data-role="totals" hidden>
      <div class="cartd-row"><span>Upfront (indicative)</span><strong data-role="upfront"></strong></div>
      <div class="cartd-row" data-role="monthly-row" hidden><span>Monthly</span><strong data-role="monthly"></strong></div>
      <p class="cartd-consult" data-role="consult-note" hidden>Some items are priced after a quick chat and are not in the totals.</p>
      <p class="cartd-note">Indicative pricing. You always get a clear, fixed quote before any work begins.</p>
    </div>

    <form class="cartd-form" data-role="form" novalidate hidden>
      <div class="cartd-hp" aria-hidden="true">
        <label>Leave this field empty
          <input type="text" name="company_website" tabindex="-1" autocomplete="off" />
        </label>
      </div>
      <label class="cartd-field"><span>Your name</span>
        <input type="text" name="name" autocomplete="name" placeholder="Jane Smith" />
      </label>
      <label class="cartd-field"><span>Email address</span>
        <input type="email" name="email" autocomplete="email" placeholder="jane@business.com.au" />
      </label>
      <label class="cartd-field"><span>Phone (optional)</span>
        <input type="tel" name="phone" autocomplete="tel" placeholder="04xx xxx xxx" />
      </label>
      <label class="cartd-field"><span>Anything we should know? (optional)</span>
        <textarea name="message" rows="2" placeholder="Tell us about your business or timeline"></textarea>
      </label>
      <p class="cartd-error" data-role="error" hidden></p>
      <button type="submit" class="btn btn-amber btn-full" data-role="submit">Request my quote</button>
    </form>

    <div class="cartd-ok" data-role="ok" hidden>
      <p><strong>Request sent.</strong> We will reply with your fixed quote within 24 hours.</p>
    </div>
  </aside>
</div>

<script>
  import * as cart from '../scripts/cart.ts';
  import type { CartItem } from '../scripts/cart-core.ts';

  const root = document.getElementById('cart-drawer')!;
  const panel = root.querySelector<HTMLElement>('.cartd-panel')!;
  const q = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const itemsEl = q<HTMLUListElement>('[data-role="items"]');
  const form = q<HTMLFormElement>('[data-role="form"]');
  let lastFocus: HTMLElement | null = null;

  function esc(s: string): string {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function render(): void {
    const resolved = cart.getResolved();
    const t = cart.getTotals();

    // Badges everywhere (header)
    document.querySelectorAll<HTMLElement>('[data-cart-badge]').forEach((b) => {
      b.textContent = String(t.count);
      b.hidden = t.count === 0;
    });

    q('[data-role="empty"]').hidden = t.count > 0;
    q('[data-role="totals"]').hidden = t.count === 0;
    form.hidden = t.count === 0;

    itemsEl.innerHTML = resolved.map((r) => `
      <li class="cartd-item" data-type="${r.type}">
        <div class="cartd-item-main">
          <span class="cartd-item-label">${esc(r.label)}${r.saving ? ` <span class="cartd-save">Save $${r.saving}</span>` : ''}</span>
          ${r.includes.length ? `<span class="cartd-item-inc">${esc(r.includes.join(' · '))}</span>` : ''}
        </div>
        <div class="cartd-item-meta">
          <span class="cartd-item-price">${esc(r.priceText)}${r.monthlyText ? `<small> +${esc(r.monthlyText)}</small>` : ''}</span>
          <button type="button" class="cartd-remove" data-cart-remove="${r.id}" aria-label="Remove ${esc(r.label)}">Remove</button>
        </div>
      </li>`).join('');

    const upfront = t.upfrontMin > 0
      ? (t.upfrontMin === t.upfrontMax
          ? 'from $' + t.upfrontMin.toLocaleString('en-AU')
          : '$' + t.upfrontMin.toLocaleString('en-AU') + ' – $' + t.upfrontMax.toLocaleString('en-AU'))
      : 'Custom quote';
    q('[data-role="upfront"]').textContent = upfront;
    q('[data-role="monthly-row"]').hidden = t.monthly === 0;
    q('[data-role="monthly"]').textContent = '$' + t.monthly.toLocaleString('en-AU') + '/mo';
    q('[data-role="consult-note"]').hidden = !t.hasConsult;
  }

  function open(): void {
    lastFocus = document.activeElement as HTMLElement;
    q<HTMLElement>('[data-role="ok"]').hidden = true;
    form.hidden = cart.getTotals().count === 0;
    root.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
    panel.focus();
  }
  function close(): void {
    root.setAttribute('data-open', 'false');
    document.body.style.overflow = '';
    lastFocus?.focus();
  }

  // Global delegation: add buttons, open triggers, remove buttons, close
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-cart-add], [data-cart-open], [data-cart-remove], [data-cart-close]'
    );
    if (!el) return;
    if (el.dataset.cartAdd) {
      cart.add({ id: el.dataset.cartAdd, type: el.dataset.cartType as CartItem['type'] });
      const prev = el.textContent;
      el.textContent = 'Added ✓';
      setTimeout(() => { el.textContent = prev; }, 1200);
      open();
    } else if (el.hasAttribute('data-cart-open')) {
      open();
    } else if (el.dataset.cartRemove) {
      cart.remove(el.dataset.cartRemove);
    } else {
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.getAttribute('data-open') === 'true') close();
  });

  document.addEventListener('cart:change', render);
  render();

  // Submit
  let sending = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    const errEl = q<HTMLElement>('[data-role="error"]');
    errEl.hidden = true;
    const val = (n: string) => (form.querySelector<HTMLInputElement>(`[name="${n}"]`)?.value || '').trim();

    const hp = val('company_website');
    if (hp) { form.hidden = true; q('[data-role="ok"]').hidden = false; return; }

    const name = val('name');
    const email = val('email');
    const showErr = (m: string) => { errEl.textContent = m; errEl.hidden = false; };
    if (!name) return showErr('Please add your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showErr('Please enter a valid email address.');

    const btn = q<HTMLButtonElement>('[data-role="submit"]');
    sending = true;
    btn.disabled = true;
    setTimeout(() => { sending = false; btn.disabled = false; }, 10000);

    try {
      await cart.submitCart({ name, email, phone: val('phone'), message: val('message'), honeypot: hp });
      cart.clear();
      form.hidden = true;
      q('[data-role="ok"]').hidden = false;
    } catch {
      errEl.innerHTML = 'Sorry, that didn’t send. Please try again, or <a href="' +
        cart.whatsAppLink() + '" target="_blank" rel="noopener">message us on WhatsApp</a>.';
      errEl.hidden = false;
    }
  });
</script>

<style>
  .cartd { position: fixed; inset: 0; z-index: 1200; pointer-events: none; }
  .cartd-overlay {
    position: absolute; inset: 0;
    background: rgba(11, 13, 16, 0.55);
    opacity: 0;
    transition: opacity var(--dur-base) var(--ease-out);
  }
  .cartd-panel {
    position: absolute; top: 0; right: 0; bottom: 0;
    width: min(430px, 100vw);
    display: flex; flex-direction: column; gap: var(--space-4);
    background: var(--white);
    border-left: 1px solid var(--charcoal-200);
    box-shadow: var(--shadow-lg);
    padding: var(--space-6);
    overflow-y: auto;
    transform: translateX(100%);
    transition: transform var(--dur-base) var(--ease-out);
  }
  .cartd[data-open="true"] { pointer-events: auto; }
  .cartd[data-open="true"] .cartd-overlay { opacity: 1; }
  .cartd[data-open="true"] .cartd-panel { transform: translateX(0); }
  @media (prefers-reduced-motion: reduce) {
    .cartd-overlay, .cartd-panel { transition: none; }
  }

  .cartd-head { display: flex; align-items: flex-start; justify-content: space-between; }
  .cartd-title { font-family: var(--font-display); font-size: var(--text-xl); font-weight: var(--weight-bold); color: var(--charcoal-900); letter-spacing: -.02em; }
  .cartd-close {
    display: inline-flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; border: 1px solid var(--charcoal-200); border-radius: 10px;
    background: transparent; color: var(--charcoal-700); cursor: pointer;
    transition: border-color var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
  }
  .cartd-close:hover { border-color: var(--amber); color: var(--amber-600); }

  .cartd-empty p { font-size: var(--text-sm); color: var(--charcoal-500); line-height: 1.6; }
  .cartd-empty a { color: var(--amber-600); }

  .cartd-items { display: flex; flex-direction: column; gap: var(--space-3); }
  .cartd-item {
    display: flex; justify-content: space-between; gap: var(--space-3);
    border: 1px solid var(--charcoal-200); border-radius: var(--radius-lg);
    padding: var(--space-4);
    background: var(--white);
  }
  .cartd-item[data-type="bundle"] { border-color: rgba(245, 158, 11, 0.45); background: linear-gradient(160deg, var(--amber-50) 0%, var(--white) 60%); }
  .cartd-item-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .cartd-item-label { font-weight: var(--weight-semibold); color: var(--charcoal-900); font-size: var(--text-sm); }
  .cartd-save {
    display: inline-block; margin-left: 4px; padding: 1px 8px; border-radius: 999px;
    background: linear-gradient(135deg, #FCD34D, #F59E0B); color: #0B0D10;
    font-family: var(--font-mono); font-size: 10px; font-weight: 600; vertical-align: 2px;
  }
  .cartd-item-inc { font-size: var(--text-xs); color: var(--charcoal-500); line-height: 1.5; }
  .cartd-item-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .cartd-item-price { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--charcoal-700); white-space: nowrap; }
  .cartd-item-price small { display: block; text-align: right; color: var(--charcoal-500); }
  .cartd-remove {
    border: none; background: none; padding: 0; cursor: pointer;
    font-size: var(--text-xs); color: var(--charcoal-500); text-decoration: underline;
  }
  .cartd-remove:hover { color: var(--amber-600); }

  .cartd-totals { border-top: 1px solid var(--charcoal-200); padding-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
  .cartd-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--charcoal-700); }
  .cartd-row strong { color: var(--charcoal-900); font-family: var(--font-display); }
  .cartd-consult, .cartd-note { font-size: var(--text-xs); color: var(--charcoal-500); line-height: 1.5; }

  .cartd-form { display: flex; flex-direction: column; gap: var(--space-3); }
  .cartd-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
  .cartd-field { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); color: var(--charcoal-500); }
  .cartd-field input, .cartd-field textarea {
    border: 1px solid var(--charcoal-200); border-radius: var(--radius-md);
    padding: .6rem .75rem; font: inherit; font-size: var(--text-sm);
    background: var(--white); color: var(--charcoal-900);
  }
  .cartd-field input:focus, .cartd-field textarea:focus { outline: 2px solid var(--amber); outline-offset: 1px; border-color: var(--amber); }
  .cartd-error { font-size: var(--text-sm); color: #DC2626; }
  .cartd-error a { color: var(--amber-600); }
  .cartd-ok p { font-size: var(--text-sm); color: var(--charcoal-700); line-height: 1.6; }
</style>
```

- [ ] **Step 3: Mount in `BaseLayout.astro`**

Add to frontmatter imports: `import CartDrawer from "../components/CartDrawer.astro";`
After `<CookieConsent />` add `<CartDrawer />`.

- [ ] **Step 4: Type check and build**

Run: `npx astro check && npx astro build`
Expected: 0 errors, build succeeds.

- [ ] **Step 5: Verify in the preview browser**

Start the dev server (`.claude/launch.json` config). On the homepage:
- Cart icon visible in header, no badge.
- In devtools console: `localStorage.setItem('rsd-cart', JSON.stringify([{id:'seo',type:'addon'}]))` then reload; badge shows 1; clicking icon opens drawer showing "SEO setup +$450", upfront $450; Remove empties it; Esc and overlay close the drawer; both themes look right.

- [ ] **Step 6: Commit**

```bash
git add src/components/CartDrawer.astro src/components/Header.astro src/layouts/BaseLayout.astro
git commit -m "feat: add quote cart drawer and header cart button"
```

---

### Task 5: /packages add-to-cart + Bundles section

**Files:**
- Modify: `src/pages/packages.astro`

**Interfaces:**
- Consumes: `[data-cart-add]` delegation from Task 4; `BUNDLES`, `PRICING` from `../data/pricing.ts`.

- [ ] **Step 1: Wire plan cards to the cart**

In the `packages` array frontmatter, add cart mapping fields to each entry:
- Landing Page Website: `cartId: "landing", cartType: "page"`
- Managed Website Care: `cartId: "care", cartType: "care"`
- Website Care Plus: `cartId: "careplus", cartType: "care"`
- AI Agent & Reception: `cartId: "ai", cartType: "addon"`

Replace the card CTA line

```astro
<a href="/contact" class={`btn btn-full ${p.featured ? "btn-amber" : "btn-outline"}`}>{p.cta}</a>
```

with

```astro
<button type="button" data-cart-add={p.cartId} data-cart-type={p.cartType} class={`btn btn-full ${p.featured ? "btn-amber" : "btn-outline"}`}>Add to cart</button>
<a href="/contact" class="pkg-talk">or talk to us first</a>
```

and add to the page `<style>`:

```css
.pkg-talk { display: block; text-align: center; margin-top: var(--space-2); font-size: var(--text-xs); color: var(--charcoal-500); }
.pkg-talk:hover { color: var(--amber-600); }
```

- [ ] **Step 2: Add the Bundles section**

Frontmatter: add `import { BUNDLES, PRICING } from "../data/pricing";` and

```ts
const allEntries = [...PRICING.pages, ...PRICING.addons, ...PRICING.care];
const labelFor = (id: string) => allEntries.find((e) => e.id === id)?.label ?? id;
```

Insert this section between the plans section (`</section>` at the end of `pkg-heading` section) and the `#compare` section:

```astro
<section class="section" aria-labelledby="bundles-heading">
  <div class="container">
    <div class="section-head reveal">
      <div class="eyebrow">Bundle &amp; save</div>
      <h2 id="bundles-heading" class="section-h2">Popular combinations, <span class="text-amber">bundled with a saving</span></h2>
      <p class="section-subline">The combinations most small businesses pick, packaged together with an indicative saving on the upfront cost. One click adds the whole bundle to your quote cart.</p>
    </div>
    <div class="bundle-grid">
      {BUNDLES.map((b, i) => (
        <div class={`bundle-card reveal ${i === 1 ? "reveal-delay-1" : i === 2 ? "reveal-delay-2" : ""}`}>
          <div class="bundle-save">Save ${b.saving.toLocaleString("en-AU")}</div>
          <h3 class="pkg-name">{b.name}</h3>
          <p class="pkg-blurb">{b.tagline}</p>
          <ul class="feat-list">
            {b.includes.map((id) => (
              <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 8l3.5 3.5 7.5-7.5" stroke="#F59E0B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {labelFor(id)}
              </li>
            ))}
          </ul>
          <div class="pkg-price"><span class="pkg-from">from</span><span class="pkg-sign">$</span><span class="pkg-num">{b.upfront.toLocaleString("en-AU")}</span><span class="pkg-per">upfront</span></div>
          {b.monthly > 0 && <p class="bundle-monthly">plus ${b.monthly.toLocaleString("en-AU")}/mo ongoing</p>}
          <button type="button" data-cart-add={b.id} data-cart-type="bundle" class="btn btn-amber btn-full">Add bundle to cart</button>
        </div>
      ))}
    </div>
    <p class="pkg-note reveal">Bundle savings are indicative and applied to the upfront cost. Your fixed quote always comes first.</p>
  </div>
</section>
```

Page `<style>` additions:

```css
.bundle-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-5); align-items: start; }
.bundle-card {
  position: relative; display: flex; flex-direction: column; gap: var(--space-4);
  background: var(--white); border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: var(--radius-xl); padding: var(--space-8) var(--space-6) var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.bundle-card:hover { transform: translateY(-4px); box-shadow: 0 24px 60px rgba(245, 158, 11, 0.14), var(--shadow-md); }
.bundle-save {
  position: absolute; top: -13px; left: var(--space-6);
  background: linear-gradient(135deg, #FCD34D, var(--amber)); color: #0B0D10;
  font-family: var(--font-mono); font-weight: 600; font-size: var(--text-xs);
  padding: .35rem .9rem; border-radius: 999px;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35);
}
.bundle-monthly { font-size: var(--text-sm); color: var(--charcoal-500); margin-top: calc(var(--space-3) * -1); }
.bundle-card .btn { margin-top: auto; }
@media (max-width: 980px) { .bundle-grid { grid-template-columns: 1fr; max-width: 460px; margin-inline: auto; } }
```

- [ ] **Step 3: Type check and build**

Run: `npx astro check && npx astro build`
Expected: 0 errors.

- [ ] **Step 4: Verify in the preview browser**

On /packages: add Managed Care (badge 1, drawer opens), add Care Plus (replaces, still 1 care item), add "Growth Engine" bundle (drawer shows one bundle line with contents and "Save $275"; upfront "from $2,475"; monthly $100/mo). Add AI Agent addon after the bundle: both present, totals add up. Both themes and mobile width look right.

- [ ] **Step 5: Commit**

```bash
git add src/pages/packages.astro
git commit -m "feat: add bundles section and add-to-cart on packages page"
```

---

### Task 6: /services add-to-cart

**Files:**
- Modify: `src/pages/services.astro`

**Interfaces:**
- Consumes: `[data-cart-add]` delegation (Task 4); `PRICING` from `../data/pricing.ts`.

**Mapping:** Email card → addon `email`; SEO card → addon `seo`; Care card → care `care`; AI card → addon `ai`. The Build card gets four tier chips (one per `PRICING.pages` entry). The Social card keeps its enquire link unchanged (no priced SKU).

- [ ] **Step 1: Add cart fields to the `categories` array**

Add `cart: { id: string; type: string } | null` and `tierPicker: boolean` to each entry:
- Website Design & Development: `cart: null, tierPicker: true`
- Business Email Setup: `cart: { id: "email", type: "addon" }, tierPicker: false`
- SEO Services: `cart: { id: "seo", type: "addon" }, tierPicker: false`
- Website Care & Maintenance: `cart: { id: "care", type: "care" }, tierPicker: false`
- Social Media Content: `cart: null, tierPicker: false`
- AI Agent & Reception: `cart: { id: "ai", type: "addon" }, tierPicker: false`

Add `import { PRICING } from "../data/pricing";` to frontmatter.

- [ ] **Step 2: Replace the card CTA block**

Replace

```astro
<a href="/contact" class="btn btn-outline btn-full svc-detail-cta">Enquire about {c.tier.toLowerCase()}</a>
```

with

```astro
{c.tierPicker ? (
  <div class="svc-detail-cta svc-tiers">
    <div class="svc-tiers-label">Add a website build to your quote cart:</div>
    <div class="svc-tiers-row">
      {PRICING.pages.map((p) => (
        <button type="button" data-cart-add={p.id} data-cart-type="page" class="svc-tier-chip">{p.label}</button>
      ))}
    </div>
  </div>
) : c.cart ? (
  <div class="svc-detail-cta">
    <button type="button" data-cart-add={c.cart.id} data-cart-type={c.cart.type} class="btn btn-outline btn-full">Add to cart</button>
    <a href="/contact" class="svc-talk">or enquire about {c.tier.toLowerCase()}</a>
  </div>
) : (
  <a href="/contact" class="btn btn-outline btn-full svc-detail-cta">Enquire about {c.tier.toLowerCase()}</a>
)}
```

Page `<style>` additions:

```css
.svc-tiers { display: flex; flex-direction: column; gap: var(--space-2); }
.svc-tiers-label { font-size: var(--text-xs); color: var(--charcoal-500); }
.svc-tiers-row { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.svc-tier-chip {
  border: 1px solid var(--charcoal-200); border-radius: 999px;
  background: var(--white); color: var(--charcoal-700);
  font-size: var(--text-xs); font-weight: var(--weight-medium);
  padding: .4rem .8rem; cursor: pointer;
  transition: border-color var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out);
}
.svc-tier-chip:hover { border-color: var(--amber); color: var(--amber-600); background: rgba(245, 158, 11, 0.06); }
.svc-talk { display: block; text-align: center; margin-top: var(--space-2); font-size: var(--text-xs); color: var(--charcoal-500); }
.svc-talk:hover { color: var(--amber-600); }
```

- [ ] **Step 3: Type check and build**

Run: `npx astro check && npx astro build`
Expected: 0 errors.

- [ ] **Step 4: Verify in the preview browser**

On /services: tier chips add a page tier (second chip replaces the first in the drawer); Email adds "Included in quote" line; SEO, Care, AI add with prices; Social card unchanged. Badge counts correct.

- [ ] **Step 5: Commit**

```bash
git add src/pages/services.astro
git commit -m "feat: add add-to-cart buttons on services page"
```

---

### Task 7: End-to-end verification

**Files:** none (verification only; fix regressions in place if found).

- [ ] **Step 1: Full check suite**

Run: `node --test tests/ && npx astro check && npx astro build`
Expected: all pass.

- [ ] **Step 2: Browser walkthrough (dev server + preview browser)**

1. /packages: add "Launch Ready" bundle, then from /services add AI addon; drawer shows bundle + AI; upfront "from $2,800" ($1,300 + $1,500), monthly $249/mo ($100 + $149).
2. Reload the page: cart persists; badge correct.
3. Add "10+ pages" tier chip: bundle replaced, consult note appears, upfront shows AI only ($1,500).
4. Remove all items: empty state, badge hidden, form hidden.
5. Add SEO, open drawer, submit with a real name/email: success state shows and cart clears (this sends one real enquiry to the endpoint; note it in the final report). If the endpoint rejects, verify the error line + WhatsApp fallback link appears with an itemised message instead, and report that the endpoint may need a `source: 'cart'` handler.
6. Failure path: with devtools offline (or blocking the request), submit; error + WhatsApp fallback link appear.
7. Both themes (toggle) and mobile viewport (375px): drawer full-width, header badge visible, bundle cards stack.
8. Keyboard: Tab into drawer, Esc closes, focus returns to the cart button.

- [ ] **Step 3: Screenshot proof**

Capture drawer-open screenshots (desktop light + dark, mobile) for the final report.

- [ ] **Step 4: Final commit if any fixes were made**

```bash
git add -A && git commit -m "fix: cart polish from end-to-end verification"
```

---

## Revision 1 tasks (2026-07-13): repricing, bundle removal, homepage growth cards

Owner-approved changes (see spec Revision 1): new 9-ending prices site-wide,
bundles deleted everywhere, homepage packages reframed as growth-stage cards.
The "do not modify CostCalculator" constraint is amended to permit exactly one
change: its hardcoded initial bracket placeholder text.

### Task 8: Reprice data and remove bundles from the cart stack

**Files:**
- Modify: `src/data/pricing.ts` (new prices; delete `Bundle` type + `BUNDLES`)
- Modify: `src/scripts/cart-core.ts` (remove `'bundle'` from `CartItemType`, delete all bundle branches in `entryFor`/`addItem`/`sanitize`/`resolveItems`/`totals`; drop `saving`/`includes` from `ResolvedItem`)
- Modify: `src/scripts/cart.ts` (remove `r.includes` usage in submit payload item labels)
- Modify: `src/components/CartDrawer.astro` (remove bundle rendering: `saving` badge markup, `includes` line, `[data-type="bundle"]` CSS in both light and dark blocks)
- Modify: `tests/cart-core.test.ts` (delete bundle tests and bundle-consistency test; update totals/resolve expectations to new prices)

**New prices (exact):** pages landing 799/1199 · business 1799/2499 · growth 2799/3799 · custom consult. addons booking 299 · blog 399 · seo 449 · ai 1499 + monthly 149 · ecom consult · email flagOnly. care 99 · careplus 149.

**Updated test expectations:** totals(landing+seo+care) = upfrontMin 1248, upfrontMax 1648, monthly 99. resolveItems: landing 'from $799–$1,199', seo '+$449'. Keep all non-bundle rule tests (page/care replacement, addon idempotence, unknown-id rejection, sanitize, consult flags).

**Verify:** `node --test` all pass · `npx astro check` no new errors beyond the 7 pre-existing · commit `feat: reprice services and remove bundles from cart`.

### Task 9: packages page repricing and bundle section removal

**Files:** Modify `src/pages/packages.astro` only.
- Delete the entire Bundles `<section>` (aria-labelledby="bundles-heading"), the `BUNDLES`/`PRICING` import + `allEntries`/`labelFor` helpers, and the `.bundle-*` CSS rules.
- Card prices: "1,000"→"799" · "100"→"99" · "150"→"149" · "1,500"→"1,499". Feature line "$149 / month management" stays.
- BaseLayout title/description props and PageHero `sub`: replace $1,000→$799 and $100/month→$99/month.
- FAQ answers: "from $1,000"→"from $799" · "from $100/month"→"from $99/month" · "from $1,500 plus $149/month"→"from $1,499 plus $149/month".

**Verify:** `npx astro check` + `npx astro build`; grep the built /packages HTML for `1,000|1,500|\$100|\$150` (expect no matches in price positions). Commit `feat: reprice packages page and remove bundles section`.

### Task 10: homepage growth-stage packages + hero price line

**Files:** Modify `src/components/Pricing.astro`, `src/components/Hero.astro`.

Hero.astro line ~93: `Websites from $1,000. Managed care from $100/month.` → `Websites from $799. Managed care from $99/month.`

Pricing.astro: keep section id/classes/structure (`pricing-grid`, `pricing-card`, `tier-*`, `pricing-phase-row`) but reframe to three growth stages, each card ending with an add-to-cart button (`data-cart-add`/`data-cart-type`, styled `btn btn-full`, `btn-amber` on the featured card, `btn-outline` otherwise) plus a small secondary link. Copy (verbatim, no em dashes):
- Section head: eyebrow `Packages`; h2 `More than websites.<br><span class="text-amber">A growth partner for your business.</span>`; subline `Start with a professional website, keep it managed every month, then automate your enquiries with an AI agent trained on your business. Add each step to your quote cart when you are ready.`
- Phase row: 01 `Get online` → 02 `Stay managed & grow` → 03 `Automate with AI` (three phases; adjust the arrow markup to fit).
- Card 1 `data-tier="get-online"`: label `Step 01 · Website Build`, name `Get Online`, price `$799 upfront` (from), line `A fast, professional website that explains what you do and turns visitors into enquiries.` Feats: `Custom, mobile-friendly website` / `Contact form with WhatsApp, phone and email buttons` / `Basic SEO and Google Search Console setup` / `Secure HTTPS, hosting and domain connection` / `Launch support`. Button adds `landing`/`page`; secondary link `or compare builds` → /packages.
- Card 2 `data-tier="managed-care"`: label `Step 02 · Monthly Care`, name `Stay Managed & Grow`, price `$99 /mo`, line `We keep your website secure, updated and visible while you run the business.` Feats: `Hosting, domain and SSL managed` / `Forms and enquiry links tested monthly` / `Basic SEO monitoring and Search Console checks` / `Small monthly updates` / `Option to add blog and social content`. Button adds `care`/`care`; secondary link `or see care plans` → /packages.
- Card 3 (featured, crown `New · AI Agent`) `data-tier="ai-agent"`: label `Step 03 · AI & Automation`, name `Automate with AI`, price `$1,499 setup`, line `A 24/7 AI receptionist trained on your business that answers questions, captures leads and books calls.` Feats: `Custom-trained on your services and FAQs` / `24/7 instant replies and lead capture` / `Qualifies enquiries and books calls` / `Ongoing training, hosting and monitoring ($149/month)`. Button adds `ai`/`addon`; secondary link `or learn more` → /services.

**Verify:** check/build; homepage renders 3 cards with working add-to-cart. Commit `feat: reframe homepage packages as growth stages with cart buttons`.

### Task 11: site-wide price sweep

**Files:** Modify `src/pages/services.astro` (AI blurb `From $1,500 setup + $149/month` → `From $1,499 setup + $149/month`), `src/layouts/BaseLayout.astro` (schema.org offers: 1000→799, 100→99, 150→149, 1500→1499, and offer description texts `from $1,000`→`from $799`, `from $1,500 plus $149/month`→`from $1,499 plus $149/month`), `src/components/CostCalculator.astro` (ONLY the initial bracket placeholder `$1,000 – $1,400` → `$799 – $1,199`).

Then sweep: `grep -rn "1,000\|1,400\|1,900\|2,600\|2,900\|3,900\|\$1,500\|\$100/\|\$150/\|from \$100\|from \$150" src/ --include="*.astro" --include="*.ts"` excluding `src/content/` and fix any remaining stale price copy (estimate.astro, contact.astro, faqs.astro, how-it-works.astro if hit). Do not touch blog content.

**Verify:** check/build; grep of `dist/` for stale prices comes back clean outside blog content. Commit `feat: apply new pricing across remaining pages and schema`.

### Task 12 (= original Task 7 rerun): end-to-end verification

Original Task 7 steps, adjusted: expected totals for bundle steps are dropped; verify instead landing ($799–$1,199) + seo (+$449) + care ($99/mo) → upfront $1,248 – $1,648, monthly $99/mo; tier/care replacement; consult flow; persistence; submit failure path with WhatsApp fallback; both themes; mobile; homepage growth cards add-to-cart. Screenshots for the final report.
