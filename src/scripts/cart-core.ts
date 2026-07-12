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
