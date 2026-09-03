/* ═══════════════════════════════════════════════════════════
   pricing.ts — single source of truth for services & pricing.
   Used by CostCalculator.astro (interactive scoper) and
   contact.astro (enquiry email pricing summary).
═══════════════════════════════════════════════════════════ */

export type Entry = {
  id: string;
  label: string;
  min?: number;
  max?: number;
  price?: number;
  monthly?: number;
  consult?: boolean;
  flagOnly?: boolean;
  recommended?: boolean;
};

export const PRICING: { pages: Entry[]; addons: Entry[]; care: Entry[]; ai: Entry[] } = {
  pages: [
    { id: 'landing',  label: '1 page (landing page)', min: 799,  max: 1199 },
    { id: 'business', label: 'Up to 5 pages',         min: 1799, max: 2499 },
    { id: 'growth',   label: '6–10 pages',            min: 2799, max: 3799 },
    { id: 'custom',   label: '10+ pages',             consult: true }
  ],
  addons: [
    { id: 'booking', label: 'Booking system',            price: 299 },
    { id: 'blog',    label: 'Blog (CMS setup)',          price: 399 },
    { id: 'seo',     label: 'SEO setup',                 price: 449 },
    // Calculator-only entry (the estimate scoper renders PRICING.addons).
    // The cart uses PRICING.ai below, so this never double-counts.
    { id: 'ai',      label: 'AI Agent (chat + reception)', price: 1499, monthly: 149 },
    { id: 'ecom',    label: 'Online store (e-commerce)', consult: true },
    { id: 'email',   label: 'Business email (M365/Google)', flagOnly: true }
  ],
  care: [
    { id: 'care',     label: 'Managed Website Care', monthly: 99, recommended: true },
    { id: 'careplus', label: 'Website Care Plus',    monthly: 149 }
  ],
  // AI Agent tiers. Own list and own cart type so choosing one replaces the
  // other rather than stacking, the way `page` and `care` already behave.
  ai: [
    // flagOnly renders as "Included in quote": Chat has no setup fee when we
    // build the site, only the monthly. consult on Custom keeps it out of the
    // totals and trips the "priced after a chat" note in the cart.
    { id: 'ai-chat',      label: 'AI Agent: Chat',      flagOnly: true, monthly: 149 },
    { id: 'ai-reception', label: 'AI Agent: Reception', price: 1499, monthly: 149, recommended: true },
    { id: 'ai-custom',    label: 'AI Agent: Custom',    consult: true }
  ]
};

const money = (n: number) => '$' + n.toLocaleString('en-AU');

/** Display-ready pricing summary lines for the enquiry email. */
export function pricingSummary() {
  return {
    build: PRICING.pages.map((p) => ({
      label: p.label,
      value: p.consult ? 'Custom quote' : `${money(p.min!)}–${money(p.max!)}`,
    })),
    addons: PRICING.addons
      .filter((a) => !a.flagOnly)
      .map((a) => ({
        label: a.label,
        value: a.consult
          ? 'Custom quote'
          : a.monthly
            ? `${money(a.price!)} + ${money(a.monthly)}/mo`
            : `+${money(a.price!)}`,
      })),
    care: PRICING.care.map((c) => ({ label: c.label, value: `${money(c.monthly!)}/mo` })),
  };
}
