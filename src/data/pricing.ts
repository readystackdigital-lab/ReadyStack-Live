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
