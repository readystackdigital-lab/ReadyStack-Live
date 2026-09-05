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
