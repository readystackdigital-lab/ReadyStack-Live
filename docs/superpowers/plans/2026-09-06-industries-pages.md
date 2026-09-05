# Industries Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an Industries mega-menu, an `/industries` index and six per-industry pages that win Australian search and AI-answer visibility and convert into quote requests.

**Architecture:** One data file (`src/data/industries.ts`) drives one dynamic Astro route (`src/pages/industries/[slug].astro`) plus an index page. The `Header.astro` mega-menu is generalised from a hardcoded `label === "Services"` check to a data-driven `menu` property so both dropdowns share one code path. No new dependencies.

**Tech Stack:** Astro 6 (static output), vanilla TypeScript, scoped CSS using the site's existing custom properties, Node `node --test` for unit tests.

**Spec:** `docs/superpowers/specs/2026-09-06-industries-pages-design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **Branch:** all work lands on `industries-pages`. Do not commit to `main`.
- **No new dependencies.** The site runs GSAP and Lenis with no framework. Nothing here needs more.
- **No em dashes** anywhere in any copy. En dashes in numeric ranges (`$1,799–$2,499`) are existing house style and are fine.
- **No decorative dot separators** (`·`, `•`) and no accent dots.
- **No invented or borrowed statistics.** Claims stay to what ReadyStack actually does.
- **Name real trades**, never an abstract category label. "Plumbers, electricians and builders", not "trade professionals".
- **Cities appear inside sentences**, never as a keyword strip.
- **Australian English** throughout (`optimise`, `specialise`, `centre`).
- **Positioning:** get online, win customers, never miss a call.
- **Dark theme is the site default.** Any new card-like class MUST be added to the `[data-theme="dark"]` selector list in `public/css/theme.css` or it will render as a white card on a dark page. This is not optional and is the single most likely defect in this build.
- **Astro scoped CSS fails silently.** One invalid declaration in a `<style>` block kills every rule after it in that block. If styles go missing, suspect this before anything else.
- **Verification commands:** `npx astro check`, `node --test tests/`, `npx astro build`.

## Deliberate deviations from the spec

Two, both recorded here so a reviewer can reject them if they disagree.

1. **No hero banner image on the industries pages.** The spec says the index uses
   `PageHero` "with banner". Every existing banner is a committed asset under
   `/assets/banners/` and no industries banner exists. `PageHero` takes `banner`
   as optional and renders correctly without it, so the pages ship unbannered.
   Commissioning `banner-industries-page.webp` (and optionally one per industry)
   is a clean follow-up, and adding it later is a one-line prop change per page.

2. **Task 2 specifies the five remaining industries by differentiator, not by
   finished sentence.** Ordinarily every plan step carries its literal content.
   Here the deliverable *is* prose, and prose cannot be specified word-for-word
   without simply writing it. The mitigation is that the implementer gets a fully
   written reference industry (tradies) to match for voice and depth, explicit
   per-industry differentiators, and a test suite that enforces every copy rule
   mechanically. If a reviewer would rather see all six written out before any
   code lands, say so and Task 2 becomes a copy-only deliverable reviewed on its
   own.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `src/data/industries.ts` | create | Single source of truth: the `Industry` type and all six entries. Data only, no markup. |
| `tests/industries.test.ts` | create | Data integrity and copy-rule enforcement over `INDUSTRIES`. |
| `src/pages/industries/[slug].astro` | create | Detail page template, `getStaticPaths` over `INDUSTRIES`, per-page JSON-LD. |
| `src/pages/industries/index.astro` | create | Index page, card grid, `ItemList` JSON-LD. |
| `src/components/Header.astro` | modify | Generalise mega-menu to a `menu` property; add the Industries nav item and dropdown. |
| `public/css/theme.css` | modify | Add the new industry card classes to the dark-theme selector list. |
| `astro.config.mjs` | modify | Add the seven new routes to the `TIERS` crawl-budget table. |

---

### Task 1: Data model, copy-rule tests, and the reference industry

Builds the type, the test harness that enforces the copy rules, and **one** industry (tradies) as the reference for voice and depth. The remaining five are written in Task 2 against this bar.

**Files:**
- Create: `src/data/industries.ts`
- Test: `tests/industries.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `export type Industry` and `export const INDUSTRIES: Industry[]`, imported by Tasks 2, 3, 4 and 5. Field names are fixed by this task and every later task depends on them exactly as written.

- [ ] **Step 1: Write the failing test file `tests/industries.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INDUSTRIES, type Industry } from '../src/data/industries.ts';

/** Every human-readable string in one industry entry, flattened. */
const allText = (i: Industry): string[] => [
  i.name, i.navLabel, i.cardPromise, i.metaTitle, i.metaDescription,
  i.heroTitle, i.heroSub, i.scenario.heading, i.scenario.body,
  ...i.trades,
  ...i.painPoints.flatMap((p) => [p.t, p.d]),
  ...i.services.flatMap((s) => [s.t, s.d]),
  ...i.faqs.flatMap((f) => [f.q, f.a]),
];

test('every slug is unique', () => {
  const slugs = INDUSTRIES.map((i) => i.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('every slug is lowercase, hyphenated and URL safe', () => {
  for (const i of INDUSTRIES) {
    assert.match(i.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad slug: ${i.slug}`);
  }
});

test('no em dashes anywhere in industry copy', () => {
  for (const i of INDUSTRIES) {
    for (const s of allText(i)) {
      assert.ok(!s.includes('—'), `em dash in ${i.slug}: ${s}`);
    }
  }
});

test('no decorative dot separators in industry copy', () => {
  for (const i of INDUSTRIES) {
    for (const s of allText(i)) {
      assert.ok(!/[·•]/.test(s), `decorative dot in ${i.slug}: ${s}`);
    }
  }
});

test('each industry names at least three real trades', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.trades.length >= 3, `${i.slug} names only ${i.trades.length} trades`);
  }
});

test('each industry has 3 to 5 pain points', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.painPoints.length >= 3 && i.painPoints.length <= 5,
      `${i.slug} has ${i.painPoints.length} pain points`);
  }
});

test('each industry selects 3 to 5 services', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.services.length >= 3 && i.services.length <= 5,
      `${i.slug} has ${i.services.length} services`);
  }
});

test('each industry has 3 to 5 faqs', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.faqs.length >= 3 && i.faqs.length <= 5,
      `${i.slug} has ${i.faqs.length} faqs`);
  }
});

test('meta titles fit the search result window', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.metaTitle.length <= 60, `${i.slug} metaTitle is ${i.metaTitle.length} chars`);
  }
});

test('meta descriptions fit the search snippet window', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.metaDescription.length <= 160,
      `${i.slug} metaDescription is ${i.metaDescription.length} chars`);
  }
});

test('the six pages do not all render the same section shape', () => {
  // Guard against the competitor failure: six pages that are one template with
  // the nouns swapped. Only meaningful once all six entries exist.
  if (INDUSTRIES.length < 6) return;
  const shapes = new Set(
    INDUSTRIES.map((i) => `${i.painPoints.length}-${i.services.length}-${i.faqs.length}`),
  );
  assert.ok(shapes.size >= 3,
    `only ${shapes.size} distinct section shapes across ${INDUSTRIES.length} industries; entries are too uniform`);
});

test('every industry names at least one Australian city somewhere in its copy', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.cities.length >= 1, `${i.slug} lists no cities`);
    const body = allText(i).join(' ');
    assert.ok(i.cities.some((c) => body.includes(c)),
      `${i.slug} lists cities but names none of them in its copy`);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/industries.test.ts`
Expected: FAIL, cannot find module `../src/data/industries.ts`.

- [ ] **Step 3: Create `src/data/industries.ts` with the type and the tradies entry**

```ts
/* ═══════════════════════════════════════════════════════════
   industries.ts — single source of truth for the Industries
   index (/industries) and the per-industry pages
   (/industries/<slug>). Data only, no markup.

   Copy rules are enforced by tests/industries.test.ts:
   no em dashes, no decorative dots, real trades named,
   at least one listed city actually used in the copy.

   painPoints, services and faqs are deliberately
   variable-length. Six pages that render identically are the
   failure mode this whole section exists to avoid.
═══════════════════════════════════════════════════════════ */

export type Industry = {
  slug: string;
  name: string;
  navLabel: string;
  trades: string[];
  cardPromise: string;
  icon: string;              // inline SVG paths, 26x26 viewBox
  metaTitle: string;         // <= 60 chars
  metaDescription: string;   // <= 160 chars
  heroTitle: string;         // may contain <span class="text-amber">
  heroSub: string;
  painPoints: { t: string; d: string }[];   // 3 to 5
  scenario: { heading: string; body: string };
  services: { t: string; d: string }[];     // 3 to 5, chosen and ordered for this industry
  faqs: { q: string; a: string }[];         // 3 to 5
  cities: string[];
};

export const INDUSTRIES: Industry[] = [
  {
    slug: 'tradies',
    name: 'Trades & Construction',
    navLabel: 'Tradies & Construction',
    trades: ['plumbers', 'electricians', 'builders', 'carpenters', 'landscapers'],
    cardPromise: 'Plumbers, electricians and builders: stop losing jobs to the calls you cannot take.',
    icon: `<path d="M5 20l7-7" stroke="#F59E0B" stroke-width="1.6" stroke-linecap="round"/><path d="M14.5 4.5a4.5 4.5 0 016 6l-3-1-2-2-1-3z" stroke="#F59E0B" stroke-width="1.4" fill="rgba(245,158,11,.08)" stroke-linejoin="round"/><path d="M4 21.5l1.5-1.5-1-1L3 20.5a1 1 0 001 1z" stroke="#F59E0B" stroke-width="1.4" stroke-linejoin="round"/><path d="M15 15l6 6" stroke="#F59E0B" stroke-width="1.6" stroke-linecap="round"/>`,
    metaTitle: 'Websites & AI Reception for Tradies | ReadyStack',
    metaDescription: 'Websites and 24/7 AI reception for Australian plumbers, electricians, builders and carpenters. Never miss a job while you are on the tools. From $799.',
    heroTitle: 'Websites and AI reception for <span class="text-amber">tradies</span>',
    heroSub: 'You cannot answer the phone with your hands full. We build the website that gets you found and the AI receptionist that picks up while you are on the tools.',
    painPoints: [
      { t: 'The phone rings while you are under a sink', d: 'Every missed call is a customer who rings the next name on the list. You find out hours later, and by then the job is gone.' },
      { t: 'Quotes go out and go quiet', d: 'You send the number, the customer goes cold, and chasing it up is the job that never gets done at the end of a long day.' },
      { t: 'A competitor turns up above you', d: 'Someone searching for an emergency plumber in Sydney or a sparky in Brisbane picks from the first few results. If you are not there, you are not in the running.' },
      { t: 'Your online presence is a Facebook page from 2019', d: 'Customers checking whether you are legitimate find a stale page, no pricing and no way to book. Plenty of them stop right there.' },
    ],
    scenario: {
      heading: 'A Tuesday, 6:40pm',
      body: 'A burst pipe in Parramatta. The customer searches, finds you, and rings. You are three suburbs away finishing a job with your phone in the van. Your AI receptionist answers on the second ring, asks what has happened, confirms you cover the area, takes the address and the number, and books the job for 8am. You read the summary when you get back to the ute. The other three plumbers they would have called next never got a look in.',
    },
    services: [
      { t: 'AI receptionist that answers every call', d: 'Around the clock, including nights and weekends. It knows your trade, your area and your rates, qualifies the job and books it into your calendar.' },
      { t: 'A website that proves you are the real thing', d: 'Your work, your service area, your licence details and a way to get in touch. Built to load fast on a phone, because that is where your customers are.' },
      { t: 'Found on Google and in AI answers', d: 'Local search setup and Google Business Profile, plus the structured data that gets you named when someone asks ChatGPT for a plumber in Melbourne.' },
      { t: 'Monthly care so it keeps working', d: 'Updates, backups, uptime and speed checks handled. You never log in, you never think about it.' },
    ],
    faqs: [
      { q: 'Do I need a website if all my work comes from word of mouth?', a: 'Word of mouth still ends in a search. Someone gets your name from a mate, then looks you up before they ring. A website is what turns that check into a call instead of a second opinion. It is also what Google and AI assistants read when someone asks for a tradie in your area.' },
      { q: 'Can the AI receptionist quote a price?', a: 'It can give the ranges you tell it to give, like a call-out fee or a starting price for common jobs. It will not invent a number for work it has not seen. For anything that needs your eyes, it takes the details and books you in.' },
      { q: 'What happens if I am on site and cannot call back straight away?', a: 'You get the customer name, number, address and what they need, by email, the moment the call ends. Nothing sits in a voicemail box waiting for you. When you do ring back you already know the job.' },
      { q: 'How quickly can I be online?', a: 'A one-page site for a solo trade is usually ready to review inside a week. Larger builds run one to three weeks depending on how fast we get your photos and details.' },
    ],
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/industries.test.ts`
Expected: PASS, 12 tests, 0 failures.

- [ ] **Step 5: Type check**

Run: `npx astro check`
Expected: 0 errors. Warnings about unrelated existing files are acceptable.

- [ ] **Step 6: Commit**

```bash
git add src/data/industries.ts tests/industries.test.ts
git commit -m "feat: industries data model with copy-rule tests and tradies entry"
```

---

### Task 2: The remaining five industries

Writes the other five entries against the voice and depth set by tradies. The tests from Task 1 run unchanged and enforce the copy rules on all six.

**Files:**
- Modify: `src/data/industries.ts` (append five entries to `INDUSTRIES`)

**Interfaces:**
- Consumes: `Industry` type from Task 1.
- Produces: `INDUSTRIES` with six entries, slugs `tradies`, `health-clinics`, `beauty-wellness`, `hospitality`, `real-estate`, `professional-services`.

- [ ] **Step 1: Append the five entries to the `INDUSTRIES` array**

Insert after the `tradies` object, before the closing `];`.

Write each entry to the same bar as tradies: a scenario with a real time and place, pain points in the reader's own words, and a services list ordered by what that industry actually cares about first. **Do not reuse the tradies sentence shapes with the nouns swapped.** That is precisely the competitor failure this section exists to beat. Vary the pain point and FAQ counts between industries.

Required shape and differentiators per industry:

- **`health-clinics`** (Health & Allied Health). Trades: physios, chiros, dentists, podiatrists, psychologists. Lead services with **AI reception and no-show reduction**, then booking, then website, then found-on-Google. Pain points centre on no-shows, reception staff tied up on the phone during consults, and after-hours booking requests. FAQs must cover patient privacy and what the agent will not do (no clinical advice, no triage). Cities: Melbourne, Sydney, Adelaide.
- **`beauty-wellness`** (Beauty & Wellness). Trades: hair salons, beauty salons, day spas, massage therapists, nail technicians. Lead with **24/7 booking and no-show reduction**, then social content, then website. Pain points centre on taking bookings while both hands are in someone's hair, DM enquiries at 11pm, and last-minute cancellations leaving gaps in the day. Cities: Brisbane, Gold Coast, Melbourne.
- **`hospitality`** (Hospitality). Trades: cafes, restaurants, bars, caterers. Lead with **social media content**, then website, then found-on-Google, then AI reception for bookings and function enquiries. Pain points centre on function and catering enquiries lost in a busy service, menus that are a photo of a PDF, and being invisible to someone searching for somewhere to eat nearby. Cities: Melbourne, Sydney.
- **`real-estate`** (Real Estate & Property). Trades: sales agents, property managers, strata managers. Lead with **AI reception for after-hours enquiries**, then website, then found-on-Google. Pain points centre on enquiries arriving during opens when nobody can pick up, maintenance calls after hours, and appraisal requests going to whoever replies first. Cities: Sydney, Brisbane, Perth.
- **`professional-services`** (Professional Services). Trades: accountants, lawyers, bookkeepers, mortgage brokers. Lead with **website credibility**, then found-on-Google and AI, then AI reception for intake, then monthly care. Pain points centre on looking less established than you are, intake calls interrupting billable work, and enquiries at tax time outpacing the phone. FAQs must cover confidentiality and what the agent will not do (no legal or financial advice). Cities: Sydney, Melbourne, Canberra.

Each entry needs a distinct `icon` (inline SVG paths, 26x26 viewBox, `stroke="#F59E0B"`, following the shape of the tradies icon and the `serviceMenu` icons in `Header.astro`).

- [ ] **Step 2: Run the tests to verify all six pass the copy rules**

Run: `node --test tests/industries.test.ts`
Expected: PASS, 12 tests, 0 failures. A failure names the offending slug and string.

- [ ] **Step 3: Confirm the six pages will not render identically**

This is enforced by the `do not all render the same section shape` test written in
Task 1, which stays inert until all six entries exist and activates here.

Run: `node --test tests/industries.test.ts`
Expected: PASS. A failure reading `only N distinct section shapes` means the five new
entries copied the tradies shape. Vary the pain point, service and FAQ counts and
rewrite the offending entries before committing.

- [ ] **Step 4: Type check**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/data/industries.ts
git commit -m "feat: add the remaining five industry entries"
```

---

### Task 3: Per-industry detail page

**Files:**
- Create: `src/pages/industries/[slug].astro`
- Modify: `public/css/theme.css` (add new card classes to the dark-theme selector list)

**Interfaces:**
- Consumes: `INDUSTRIES` and `Industry` from `src/data/industries.ts`; `BaseLayout` (accepts `title`, `description`, `breadcrumb`), `Header`, `Footer`, `PageHero` (accepts `eyebrow`, `title`, `sub`, `primaryLabel`, `primaryHref`, `secondaryLabel`, `secondaryHref`), `CtaBand` (accepts `eyebrow`, `heading`, `sub`, `primaryLabel`, `primaryHref`, `secondaryLabel`, `secondaryHref`).
- Produces: routes `/industries/<slug>` for all six.

- [ ] **Step 1: Create `src/pages/industries/[slug].astro`**

```astro
---
import type { GetStaticPaths } from "astro";
import BaseLayout from "../../layouts/BaseLayout.astro";
import Header from "../../components/Header.astro";
import Footer from "../../components/Footer.astro";
import PageHero from "../../components/PageHero.astro";
import CtaBand from "../../components/CtaBand.astro";
import { INDUSTRIES, type Industry } from "../../data/industries";

export const getStaticPaths = (() =>
  INDUSTRIES.map((industry) => ({
    params: { slug: industry.slug },
    props: { industry },
  }))) satisfies GetStaticPaths;

const { industry } = Astro.props as { industry: Industry };

const siteUrl = "https://readystackdigital.com";
const pageUrl = `${siteUrl}/industries/${industry.slug}`;

// FAQPage: the primary lever for being quoted by ChatGPT and Perplexity.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: industry.faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: `${industry.name} websites and AI reception`,
  serviceType: industry.name,
  url: pageUrl,
  provider: { "@id": `${siteUrl}/#business` },
  areaServed: { "@type": "Country", name: "Australia" },
  audience: {
    "@type": "BusinessAudience",
    name: industry.name,
    description: industry.trades.join(", "),
  },
};

// Explicit crumbs: BaseLayout's auto-derivation would flatten the nested path
// into a single crumb.
const breadcrumb = [
  { name: "Home", path: "/" },
  { name: "Industries", path: "/industries" },
  { name: industry.name, path: `/industries/${industry.slug}` },
];
---

<BaseLayout
  title={industry.metaTitle}
  description={industry.metaDescription}
  breadcrumb={breadcrumb}
>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(faqSchema)} is:inline />
    <script type="application/ld+json" set:html={JSON.stringify(serviceSchema)} is:inline />
  </Fragment>

  <Header />
  <main id="main-content">
    <PageHero
      eyebrow={industry.name}
      title={industry.heroTitle}
      sub={industry.heroSub}
      primaryLabel="Get My Free Quote"
      primaryHref="/estimate"
      secondaryLabel="Book a Call"
      secondaryHref="/contact"
    />

    <section class="section" aria-labelledby="ind-problem-heading">
      <div class="container">
        <div class="section-head reveal">
          <div class="eyebrow">Sound familiar</div>
          <h2 id="ind-problem-heading" class="section-h2">Where the work leaks out</h2>
        </div>
        <div class="ind-pain-grid">
          {industry.painPoints.map((p) => (
            <article class="ind-pain reveal">
              <h3 class="ind-pain-t">{p.t}</h3>
              <p class="ind-pain-d">{p.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section class="section section-tinted" aria-labelledby="ind-scenario-heading">
      <div class="container">
        <div class="ind-scenario reveal">
          <div class="eyebrow">{industry.scenario.heading}</div>
          <h2 id="ind-scenario-heading" class="ind-scenario-body">{industry.scenario.body}</h2>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="ind-services-heading">
      <div class="container">
        <div class="section-head reveal">
          <div class="eyebrow">What we build</div>
          <h2 id="ind-services-heading" class="section-h2">Built around how you actually work</h2>
        </div>
        <div class="ind-svc-grid">
          {industry.services.map((s) => (
            <article class="ind-svc reveal">
              <h3 class="ind-svc-t">{s.t}</h3>
              <p class="ind-svc-d">{s.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section class="section section-tinted" aria-labelledby="ind-faq-heading">
      <div class="container-sm">
        <div class="section-head reveal">
          <div class="eyebrow">Questions</div>
          <h2 id="ind-faq-heading" class="section-h2">What {industry.navLabel.toLowerCase()} ask us</h2>
        </div>
        <div class="ind-faqs reveal">
          {industry.faqs.map((f) => (
            <details class="ind-faq">
              <summary class="ind-faq-q">
                <span>{f.q}</span>
                <svg class="ind-faq-chev" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </summary>
              <p class="ind-faq-a">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>

    <CtaBand
      eyebrow="Ready when you are"
      heading={`Let's get your ${industry.navLabel.toLowerCase()} business winning more work`}
      sub="Tell us what you need and we will come back with a fixed price. No obligation, no lock-in."
      primaryLabel="Get My Free Quote"
      primaryHref="/estimate"
      secondaryLabel="Talk to us"
      secondaryHref="/contact"
    />
  </main>
  <Footer />
</BaseLayout>

<style>
  .ind-pain-grid,
  .ind-svc-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
  }

  .ind-pain,
  .ind-svc {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-6);
    border: 1px solid var(--charcoal-200);
    border-radius: var(--radius-xl);
    background: var(--white);
    box-shadow: var(--nm-raised);
    transition: border-color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
  }
  .ind-pain:hover,
  .ind-svc:hover {
    border-color: var(--amber);
    transform: translateY(-3px);
  }

  .ind-pain-t,
  .ind-svc-t {
    font-family: var(--font-display);
    font-size: 1.0625rem;
    font-weight: var(--weight-semibold);
    line-height: 1.3;
    color: var(--charcoal-900);
  }
  .ind-pain-d,
  .ind-svc-d {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--charcoal-600);
  }

  .ind-scenario {
    max-width: 62ch;
    margin-inline: auto;
    text-align: center;
  }
  .ind-scenario-body {
    margin-top: var(--space-3);
    font-family: var(--font-display);
    font-size: clamp(1.125rem, 2.2vw, 1.5rem);
    font-weight: var(--weight-light);
    line-height: 1.55;
    color: var(--charcoal-800);
  }

  .ind-faqs {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .ind-faq {
    border: 1px solid var(--charcoal-200);
    border-radius: var(--radius-lg);
    background: var(--white);
    padding: var(--space-4) var(--space-5);
  }
  .ind-faq-q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    cursor: pointer;
    list-style: none;
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: var(--weight-medium);
    color: var(--charcoal-900);
  }
  .ind-faq-q::-webkit-details-marker { display: none; }
  .ind-faq-chev {
    flex-shrink: 0;
    color: var(--amber);
    transition: transform var(--dur-base) var(--ease-out);
  }
  .ind-faq[open] .ind-faq-chev { transform: rotate(180deg); }
  .ind-faq-a {
    margin-top: var(--space-3);
    font-size: 0.9375rem;
    line-height: 1.65;
    color: var(--charcoal-600);
  }

  @media (max-width: 860px) {
    .ind-pain-grid,
    .ind-svc-grid { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ind-pain, .ind-svc, .ind-faq-chev { transition: none; }
    .ind-pain:hover, .ind-svc:hover { transform: none; }
  }
</style>
```

- [ ] **Step 2: Add the new card classes to the dark-theme selector list**

The site is dark by default. Without this the new cards render white on a dark page.

In `public/css/theme.css`, find the selector list containing `[data-theme="dark"] .svc-detail,` and add three selectors to it, immediately after the `.svc-detail` line:

```css
[data-theme="dark"] .ind-pain,
[data-theme="dark"] .ind-svc,
[data-theme="dark"] .ind-faq,
```

- [ ] **Step 3: Build and confirm all six routes are generated**

Run:
```bash
npx astro build && ls dist/industries/
```
Expected: build succeeds; directory listing shows `beauty-wellness`, `health-clinics`, `hospitality`, `professional-services`, `real-estate`, `tradies`.

- [ ] **Step 4: Confirm each page carries its own FAQ schema and title**

Run:
```bash
for s in tradies health-clinics beauty-wellness hospitality real-estate professional-services; do
  printf "%-24s FAQPage:%s Service:%s title:%s\n" "$s" \
    "$(grep -c 'FAQPage' dist/industries/$s/index.html)" \
    "$(grep -c '"Service"' dist/industries/$s/index.html)" \
    "$(sed -n 's/.*<title>\(.*\)<\/title>.*/\1/p' dist/industries/$s/index.html | head -1 | cut -c1-40)"
done
```
Expected: every row shows `FAQPage:1 Service:1` and a distinct title. Two rows sharing a title is a bug in the data.

- [ ] **Step 5: Commit**

```bash
git add 'src/pages/industries/[slug].astro' public/css/theme.css
git commit -m "feat: per-industry pages with FAQ, Service and breadcrumb schema"
```

---

### Task 4: Industries index page

**Files:**
- Create: `src/pages/industries/index.astro`
- Modify: `public/css/theme.css` (add the index card class to the dark-theme list)

**Interfaces:**
- Consumes: `INDUSTRIES` from `src/data/industries.ts`; `BaseLayout`, `Header`, `Footer`, `PageHero`, `CtaBand`.
- Produces: route `/industries`.

- [ ] **Step 1: Create `src/pages/industries/index.astro`**

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import Header from "../../components/Header.astro";
import Footer from "../../components/Footer.astro";
import PageHero from "../../components/PageHero.astro";
import CtaBand from "../../components/CtaBand.astro";
import { INDUSTRIES } from "../../data/industries";

const siteUrl = "https://readystackdigital.com";

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Industries ReadyStack Digital works with",
  itemListElement: INDUSTRIES.map((i, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: i.name,
    url: `${siteUrl}/industries/${i.slug}`,
  })),
};

const breadcrumb = [
  { name: "Home", path: "/" },
  { name: "Industries", path: "/industries" },
];
---

<BaseLayout
  title="Industries We Work With | ReadyStack Digital"
  description="Websites and 24/7 AI reception built for Australian tradies, clinics, salons, cafes, agencies and professional services. Fixed pricing, no lock-in contracts."
  breadcrumb={breadcrumb}
>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(itemListSchema)} is:inline />
  </Fragment>

  <Header />
  <main id="main-content">
    <PageHero
      eyebrow="Industries"
      title='Built for the way <span class="text-amber">your trade</span> actually works'
      sub="A cafe and a physio clinic do not lose customers the same way. Pick your industry and see what we would build, and what it would cost."
      primaryLabel="Get My Free Quote"
      primaryHref="/estimate"
      secondaryLabel="See All Services"
      secondaryHref="/services"
    />

    <section class="section section-tinted" aria-labelledby="ind-index-heading">
      <div class="container">
        <div class="section-head reveal">
          <div class="eyebrow">Who we work with</div>
          <h2 id="ind-index-heading" class="section-h2">Find your industry</h2>
          <p class="section-subline">Every one of these pages is written for that trade, not filled in from a template.</p>
        </div>

        <div class="ind-card-grid">
          {INDUSTRIES.map((i) => (
            <a href={`/industries/${i.slug}`} class="ind-card reveal">
              <span class="ind-card-ico" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" set:html={i.icon}></svg>
              </span>
              <h3 class="ind-card-t">{i.name}</h3>
              <p class="ind-card-p">{i.cardPromise}</p>
              <span class="ind-card-trades">{i.trades.join(", ")}</span>
              <span class="ind-card-go">
                See what we build
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>

    <CtaBand
      eyebrow="Not on the list"
      heading="We work with plenty of businesses that are not on this page"
      sub="If your trade is not here, it does not mean we cannot help. Tell us what you do and we will tell you straight whether we are a fit."
      primaryLabel="Get My Free Quote"
      primaryHref="/estimate"
      secondaryLabel="Talk to us"
      secondaryHref="/contact"
    />
  </main>
  <Footer />
</BaseLayout>

<style>
  .ind-card-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-5);
  }

  .ind-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-6);
    border: 1px solid var(--charcoal-200);
    border-radius: var(--radius-xl);
    background: var(--white);
    box-shadow: var(--nm-raised);
    text-decoration: none;
    transition: border-color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
  }
  .ind-card:hover {
    border-color: var(--amber);
    transform: translateY(-4px);
  }

  .ind-card-ico {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: var(--radius-md);
    border: 1px solid rgba(245, 158, 11, 0.22);
    background: rgba(245, 158, 11, 0.08);
    transition: transform var(--dur-base) var(--ease-spring);
  }
  .ind-card:hover .ind-card-ico { transform: rotate(-5deg) scale(1.07); }

  .ind-card-t {
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: var(--weight-semibold);
    line-height: 1.25;
    color: var(--charcoal-900);
  }
  .ind-card-p {
    font-size: 0.9375rem;
    line-height: 1.55;
    color: var(--charcoal-600);
  }
  .ind-card-trades {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--charcoal-500);
  }
  .ind-card-go {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: auto;
    padding-top: var(--space-2);
    font-size: 0.8125rem;
    font-weight: var(--weight-medium);
    color: var(--amber-600);
  }
  .ind-card:hover .ind-card-go svg { transform: translateX(3px); }
  .ind-card-go svg { transition: transform var(--dur-base) var(--ease-out); }

  @media (max-width: 980px) {
    .ind-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 640px) {
    .ind-card-grid { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ind-card, .ind-card-ico, .ind-card-go svg { transition: none; }
    .ind-card:hover { transform: none; }
    .ind-card:hover .ind-card-ico { transform: none; }
  }
</style>
```

- [ ] **Step 2: Add `.ind-card` to the dark-theme selector list**

In `public/css/theme.css`, in the same selector list edited in Task 3, add:

```css
[data-theme="dark"] .ind-card,
```

Then confirm the amber link colour still reads on dark. In the same file, near the other `[data-theme="dark"]` text rules, add:

```css
[data-theme="dark"] .ind-card-t { color: rgba(255, 255, 255, 0.94) !important; }
[data-theme="dark"] .ind-card-p,
[data-theme="dark"] .ind-card-trades { color: rgba(255, 255, 255, 0.60) !important; }
[data-theme="dark"] .ind-card-go { color: var(--amber) !important; }
[data-theme="dark"] .ind-pain-t,
[data-theme="dark"] .ind-svc-t { color: rgba(255, 255, 255, 0.94) !important; }
[data-theme="dark"] .ind-pain-d,
[data-theme="dark"] .ind-svc-d,
[data-theme="dark"] .ind-faq-a { color: rgba(255, 255, 255, 0.60) !important; }
[data-theme="dark"] .ind-faq-q { color: rgba(255, 255, 255, 0.94) !important; }
[data-theme="dark"] .ind-scenario-body { color: rgba(255, 255, 255, 0.82) !important; }
```

- [ ] **Step 3: Build and confirm the index renders with six links**

Run:
```bash
npx astro build && grep -o 'href="/industries/[a-z-]*"' dist/industries/index.html | sort -u
```
Expected: exactly six distinct hrefs, one per slug.

- [ ] **Step 4: Confirm ItemList schema is present**

Run: `grep -c 'ItemList' dist/industries/index.html`
Expected: `1`

- [ ] **Step 5: Commit**

```bash
git add src/pages/industries/index.astro public/css/theme.css
git commit -m "feat: industries index page with ItemList schema"
```

---

### Task 5: Header mega-menu generalisation and Industries nav item

`Header.astro` hardcodes `item.label === "Services"` in four places. This task replaces that with a data-driven `menu` property so both dropdowns share one code path, then adds Industries.

**Files:**
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: `INDUSTRIES` from `src/data/industries.ts`.
- Produces: no exports. Adds `/industries` to `primaryNav`, `desktopNav` and `mobileNav`, and a second mega-menu panel.

- [ ] **Step 1: Import the industries data and build the second menu**

In the frontmatter of `src/components/Header.astro`, add the import at the top:

```ts
import { INDUSTRIES } from "../data/industries";
```

Then, after the existing `serviceMenu` array, add:

```ts
// Industries mega-menu, generated from the same data that drives /industries
// so the dropdown can never drift from the pages.
const industryMenu = INDUSTRIES.map((i) => ({
  label: i.navLabel,
  href: `/industries/${i.slug}`,
  blurb: i.trades.slice(0, 3).join(", "),
  icon: i.icon,
}));
```

- [ ] **Step 2: Attach menus to nav items instead of matching on label**

Replace the `primaryNav`, `desktopNav` and `mobileNav` declarations with:

```ts
const primaryNav = [
  { label: "Services", href: "/services", menu: serviceMenu },
  { label: "Industries", href: "/industries", menu: industryMenu },
  { label: "Pricing", href: "/packages" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
  { label: "Social", href: "/social" },
  { label: "Blog", href: "/blog" },
];
// Desktop inline nav is trimmed to the highest-intent items + CTA.
// FAQs and Social stay reachable via the mobile hamburger only.
const desktopNav = primaryNav.filter((item) =>
  ["Services", "Industries", "Pricing", "How It Works", "Contact", "Blog"].includes(item.label)
);
const mobileNav = [
  { label: "Home", href: "/" },
  ...primaryNav,
];
```

- [ ] **Step 3: Drive the four dropdown conditions off `item.menu`**

In the `desktopNav.map(...)` block, replace all four `item.label === "Services"` checks. The `<li>` becomes:

```astro
<li class:list={["nav-item", { "has-mega": item.menu }]}>
  <a
    href={item.href}
    class:list={["nav-link", { active: isActive(item.href) }]}
    aria-current={isActive(item.href) ? "page" : undefined}
    aria-haspopup={item.menu ? "true" : undefined}
  >
    {item.label}
    {item.menu && (
      <svg class="nav-caret" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
    )}
  </a>

  {item.menu && (
    <div class="mega">
      <div class="mega-panel">
        <span class="mega-sheen" aria-hidden="true"></span>
        <div class="mega-grid" role="group" aria-label={item.label}>
          {item.menu.map((entry, i) => (
            <a href={entry.href} class="mega-item" style={`--i:${i}`}>
              <span class="mega-ico" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" set:html={entry.icon}></svg>
              </span>
              <span class="mega-copy">
                <span class="mega-title">{entry.label}</span>
                <span class="mega-blurb">{entry.blurb}</span>
              </span>
              <svg class="mega-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          ))}
        </div>
        <div class="mega-foot">
          <a href={item.href} class="mega-all">
            {item.label === "Services" ? "See all services" : "See all industries"}
          </a>
          <a href="/estimate" class="mega-cta">Get a Quote</a>
        </div>
      </div>
    </div>
  )}
</li>
```

Nothing in the `<style>` block changes. Both panels reuse the existing CSS, sheen, stagger, light-theme overrides and the Escape handler.

- [ ] **Step 4: Type check and build**

Run: `npx astro check && npx astro build`
Expected: 0 errors, build succeeds.

- [ ] **Step 5: Confirm both dropdowns render in the built HTML**

Run:
```bash
grep -c 'class="mega-panel"' dist/index.html
grep -o 'href="/industries/[a-z-]*"' dist/index.html | sort -u | wc -l
```
Expected: `2` panels, and `6` distinct industry hrefs present in the header of every page.

- [ ] **Step 6: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: data-driven mega-menus and Industries nav item"
```

---

### Task 6: Sitemap tiers and full verification

**Files:**
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: the six slugs from `src/data/industries.ts` (hardcoded into the `TIERS` table, which is a plain object literal in the Astro config).

- [ ] **Step 1: Add the seven routes to the `TIERS` table**

In `astro.config.mjs`, inside the `TIERS` object, add these entries after the `'/services'` line:

```js
  '/industries': [0.8, ChangeFreqEnum.MONTHLY],
  '/industries/tradies': [0.7, ChangeFreqEnum.MONTHLY],
  '/industries/health-clinics': [0.7, ChangeFreqEnum.MONTHLY],
  '/industries/beauty-wellness': [0.7, ChangeFreqEnum.MONTHLY],
  '/industries/hospitality': [0.7, ChangeFreqEnum.MONTHLY],
  '/industries/real-estate': [0.7, ChangeFreqEnum.MONTHLY],
  '/industries/professional-services': [0.7, ChangeFreqEnum.MONTHLY],
```

- [ ] **Step 2: Build and confirm the sitemap carries all seven at the intended priorities**

Run:
```bash
npx astro build && grep -o '<loc>[^<]*industries[^<]*</loc>' dist/sitemap-0.xml
```
Expected: seven `<loc>` entries, `/industries` plus the six slugs.

- [ ] **Step 3: Run the full check suite**

Run: `node --test tests/ && npx astro check && npx astro build`
Expected: all tests pass, 0 type errors, build succeeds.

- [ ] **Step 4: Browser verification, desktop widths**

Start the dev server (`astro-dev` from `.claude/launch.json`, port 4321) and load `/industries`.

Check at **1280px, 1024px and 900px**:
- The desktop nav does not wrap and items do not visually collide with the Get a Quote CTA.
- Both Services and Industries dropdowns open on hover and stay open while the pointer travels into the panel.
- Tab focus opens each dropdown; Escape closes it.

**If the nav crowds at any width: stop, screenshot the affected widths, and report to the owner.** Per the spec, no nav item may be dropped and type may not be shrunk without an owner decision.

- [ ] **Step 5: Browser verification, theme and content**

- Toggle light and dark. Confirm every card on `/industries` and on `/industries/tradies` has the correct surface in both. A white card on a dark page means a class is missing from the `theme.css` selector list.
- Load all six detail pages. Confirm each shows its own scenario, pain points and FAQs, and that no two read as the same page with nouns swapped.
- Open and close several FAQ `<details>` blocks.
- Check `/industries` at 375px mobile width.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs
git commit -m "feat: sitemap crawl-budget tiers for industries routes"
```

---

## Done when

- `node --test tests/ && npx astro check && npx astro build` is clean.
- Seven new routes build, each with its own title, description and schema.
- Both mega-menus work on hover, keyboard and Escape.
- Light and dark both render correctly on the index and all six detail pages.
- Nav crowding at 900 to 1280px has been checked and either passes or has been reported to the owner with screenshots.
