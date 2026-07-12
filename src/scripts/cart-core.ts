/* ═══════════════════════════════════════════════════════════
   cart-core.ts — pure quote-cart rules. No DOM, no storage.
   The cart holds { id, type } only; every price is resolved
   from pricing.ts at call time so saved carts never go stale.
   Ids are stable and map 1:1 to future Stripe Price IDs.
═══════════════════════════════════════════════════════════ */

import { PRICING, type Entry } from '../data/pricing.ts';

export type CartItemType = 'page' | 'addon' | 'care';
export type CartItem = { id: string; type: CartItemType };

export type ResolvedItem = {
  id: string;
  type: CartItemType;
  label: string;
  priceText: string;
  monthlyText: string | null;
};

export type CartTotals = {
  upfrontMin: number;
  upfrontMax: number;
  monthly: number;
  hasConsult: boolean;
  count: number;
};

const LISTS: Record<CartItemType, Entry[]> = {
  page: PRICING.pages,
  addon: PRICING.addons,
  care: PRICING.care,
};

export const money = (n: number) => '$' + n.toLocaleString('en-AU');

function entryFor(item: CartItem): Entry | undefined {
  return LISTS[item.type]?.find((e) => e.id === item.id);
}

export function addItem(items: CartItem[], item: CartItem): CartItem[] {
  const entry = entryFor(item);
  if (!entry) return items;

  let next = items.filter((i) => !(i.id === item.id && i.type === item.type));

  if (item.type === 'page' || item.type === 'care') {
    next = next.filter((i) => i.type !== item.type);
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
    if (type !== 'page' && type !== 'addon' && type !== 'care') continue;
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
    const e = entry;
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
    const e = entry;
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
