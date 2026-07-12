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
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      storageOk = false;
      memoryItems = items;
    }
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
