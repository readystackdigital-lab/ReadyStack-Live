/* ═══════════════════════════════════════════════════════════
   pricing.ts — single source of truth for services & pricing.
   Used by CostCalculator.astro (interactive scoper) and
   contact.astro (enquiry email pricing summary).
═══════════════════════════════════════════════════════════ */

type Entry = {
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

export const PRICING: { pages: Entry[]; addons: Entry[]; care: Entry[] } = {
  pages: [
    { id: 'landing',  label: '1 page (landing page)', min: 1000, max: 1400 },
    { id: 'business', label: 'Up to 5 pages',         min: 1900, max: 2600 },
    { id: 'growth',   label: '6–10 pages',            min: 2900, max: 3900 },
    { id: 'custom',   label: '10+ pages',             consult: true }
  ],
  addons: [
    { id: 'booking', label: 'Booking system',            price: 300 },
    { id: 'blog',    label: 'Blog (CMS setup)',          price: 400 },
    { id: 'seo',     label: 'SEO setup',                 price: 450 },
    { id: 'ai',      label: 'AI chatbot & reception',    price: 1500, monthly: 149 },
    { id: 'ecom',    label: 'Online store (e-commerce)', consult: true },
    { id: 'email',   label: 'Business email (M365/Google)', flagOnly: true }
  ],
  care: [
    { id: 'care',     label: 'Managed Website Care', monthly: 100, recommended: true },
    { id: 'careplus', label: 'Website Care Plus',    monthly: 150 }
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
