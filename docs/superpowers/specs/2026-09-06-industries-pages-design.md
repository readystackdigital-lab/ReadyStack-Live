# Industries Tab, Index and Per-Industry Pages: Design Spec

Date: 2026-09-06
Status: Approved by owner (conversation 2026-09-06)

## Goal

Add an Industries section to the ReadyStack site: a nav dropdown, an index page,
and six per-industry pages. The pages exist to win search and AI-answer
visibility for the phrases Australian small businesses actually use ("website
for tradies", "AI receptionist for a dental clinic"), and to convert that
traffic into quote requests.

The competitor teardown that prompted this (aussiebusinessai.com.au/industries,
reviewed 2026-09-05) ships 18 visibly templated pages, one of which still
renders a raw `beauty-wellness` slug as its card title. The differentiator here
is genuinely written per-industry copy, not page count.

## Decisions (owner-approved)

1. **Six industries at launch**, not 18. Depth over surface area. Six also drops
   into the existing two-column mega-menu grid with no new layout work.
2. **Content lives in the main website folder.** Routes under
   `src/pages/industries/`, data in `src/data/industries.ts`. No Pages CMS
   wiring, no Astro content collection.
3. **Industry pages only, no industry-by-city URLs.** Australian cities are
   named inside the copy where they read naturally. An industry-by-city matrix
   is the doorway-page pattern and is explicitly rejected.
4. **Industries gets a mega-menu** mirroring Services, reusing the existing
   CSS-only hover and focus dropdown.
5. **One template plus a rich data file**, not six hand-written pages.

### Why one template is not the templated-feel risk

The competitor's failure is lazy copy, interpolating a noun into a stock
sentence, not a shared layout. Stripe, Xero and Square all render industry
pages from one template and none read as generated. The mitigation is a data
model rich enough to vary: per-industry headline, a variable number of pain
points, its own scenario, its own FAQ set. Same skeleton, different flesh.

Rejected alternatives:

- **Six hand-written `.astro` pages.** Six files that drift apart on every
  design change and six places to fix a schema bug. The extra freedom is
  theoretical since all six pages do the same job.
- **Template plus per-industry override slots.** Speculative until an industry
  actually needs a one-off section. Add it when one does.

## The six industries

| Industry | Slug | Trades named in the card |
|---|---|---|
| Trades & Construction | `tradies` | plumbers, electricians, builders, carpenters, landscapers |
| Health & Allied Health | `health-clinics` | physios, chiros, dentists, podiatrists, psychologists |
| Beauty & Wellness | `beauty-wellness` | hair salons, beauty salons, day spas, massage, nail techs |
| Hospitality | `hospitality` | cafes, restaurants, bars, caterers |
| Real Estate & Property | `real-estate` | agents, property managers, strata |
| Professional Services | `professional-services` | accountants, lawyers, bookkeepers, mortgage brokers |

`tradies` is chosen over `trades` because it is the term Australians search.

## Data model

New file `src/data/industries.ts`, shaped after the existing `src/data/pricing.ts`
convention (exported type plus a single exported const).

```ts
export type Industry = {
  slug: string;            // URL segment, e.g. "tradies"
  name: string;            // "Trades & Construction"
  navLabel: string;        // shorter label for the mega-menu
  trades: string[];        // real trades named in the card and copy
  cardPromise: string;     // one-line concrete promise for the index card
  icon: string;            // inline SVG paths, same convention as serviceMenu
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;       // may contain <span class="text-amber">
  heroSub: string;
  painPoints: { t: string; d: string }[];   // 3 to 5, industry-specific
  scenario: { heading: string; body: string };
  services: { t: string; d: string }[];     // 3 to 5 of the six ReadyStack
                                            // services, chosen and reworded for
                                            // this industry, not all six by rote
  faqs: { q: string; a: string }[];         // 3 to 5, industry-specific
  cities: string[];                          // named naturally in copy
};

export const INDUSTRIES: Industry[] = [ /* six entries */ ];
```

`painPoints`, `services` and `faqs` are all deliberately variable-length so the
six pages do not render identically. `services` selects the subset of the six
ReadyStack services that genuinely matter to that industry, in the order that
matters to them. A hospitality page leading with social content and a tradie
page leading with AI reception is the point, not an inconsistency.

## Pages

### `/industries` (index)

`src/pages/industries/index.astro`

1. `PageHero` with banner, eyebrow, title, sub, primary CTA to `/estimate`
2. Card grid, one card per industry: icon, name, `cardPromise`, the named trades,
   link arrow
3. `CtaBand`

Schema: `ItemList` enumerating the six industry pages.

### `/industries/[slug]` (detail)

`src/pages/industries/[slug].astro`, using `getStaticPaths()` over `INDUSTRIES`.

1. `PageHero` from `heroTitle` and `heroSub`
2. The problem: `painPoints`, written for that trade
3. Scenario: short, in the reader's language
4. What we build for you: `services`, the relevant subset reworded per industry
5. FAQs: `faqs`, industry-specific
6. `CtaBand`

Schema per page:

- `BreadcrumbList` via the `breadcrumb` prop `BaseLayout` already accepts:
  Home, Industries, industry name. Without the explicit prop the layout's
  auto-derivation would produce a single flattened crumb from the path.
- `FAQPage` built from `faqs`, matching the pattern in `src/pages/faqs.astro`.
  This is the primary lever for being quoted by ChatGPT and Perplexity.
- A lean `Service` node with `serviceType`, `audience` and `provider` pointing at
  the existing `https://readystackdigital.com/#business` node.

## Header refactor

`src/components/Header.astro` currently hardcodes `item.label === "Services"` in
four places (the `has-mega` class, `aria-haspopup`, the caret, and the panel
block). Adding a second dropdown by duplicating that condition would be the
wrong shortcut.

Change: give nav items an optional `menu` property holding the dropdown entries,
and drive all four conditions off `item.menu` instead of the label string. Both
dropdowns then share one code path. The existing panel CSS, sheen, stagger,
light-theme overrides and Escape handler are reused untouched.

Nav arrays updated: `primaryNav`, `desktopNav` (the allow-list array), and
`mobileNav` all gain Industries.

**Known risk:** desktop nav goes from five items to six plus the Get a Quote CTA.
This must be verified in the browser at 900px, 1024px and 1280px before the work
is called done.

Owner decision (2026-09-06): **no nav item is dropped in this build.** Blog stays
in the desktop bar. If the verification step shows crowding, report it with
screenshots at the affected widths and let the owner decide what gives. Do not
silently remove a nav item, and do not shrink type to force a fit.

## Sitemap

`astro.config.mjs` holds a hand-tuned `TIERS` table for crawl budget. Add:

- `/industries` at priority 0.8, changefreq monthly
- each `/industries/<slug>` at priority 0.7, changefreq monthly

Routes absent from `TIERS` fall through to sitemap defaults, so this is required,
not cosmetic.

## Copy rules

Binding on every line written for these pages:

- No em dashes anywhere.
- No decorative dot separators or accent dots.
- No invented or borrowed statistics. Claims stay to what ReadyStack does.
- Name real trades, never an abstract category label.
- Cities appear inside sentences, never as a keyword strip.
- Australian English and Australian context throughout.
- Follow the established positioning: get online, win customers, never miss a
  call.

## Out of scope

- Industry-by-city pages.
- Pages CMS editing of industries.
- Any change to `/services`, `/packages`, `/estimate` or the quote cart.
- New dependencies. The site runs GSAP and Lenis with no framework; nothing here
  needs more.

## Verification

- `npm run build` completes clean.
- Every industry route renders and returns its own title, description and FAQ
  schema.
- Both mega-menus open on hover and on keyboard focus, and Escape closes them.
- Desktop nav does not wrap or crowd at 900px, 1024px and 1280px.
- `/industries` and all six routes appear in the built sitemap at the
  intended priorities.
- Light and dark themes both render correctly. Per project history, a single bad
  declaration in a scoped style block silently kills every rule after it, so the
  new styles get an explicit visual check in both themes.
