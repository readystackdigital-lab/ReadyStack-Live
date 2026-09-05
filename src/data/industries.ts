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
  {
    slug: 'health-clinics',
    name: 'Health & Allied Health',
    navLabel: 'Health & Allied Health',
    trades: ['physios', 'chiros', 'dentists', 'podiatrists', 'psychologists'],
    cardPromise: 'Physios, chiros and dentists: fill the gaps no-shows leave and give your front desk back to the people standing at it.',
    icon: `<rect x="5" y="4" width="16" height="19" rx="3" stroke="#F59E0B" stroke-width="1.4" fill="none"/><path d="M10 3.5h6a1 1 0 011 1V7H9V4.5a1 1 0 011-1z" stroke="#F59E0B" stroke-width="1.3" fill="rgba(245,158,11,.08)" stroke-linejoin="round"/><path d="M13 11.5v6.5M9.8 14.8h6.4" stroke="#F59E0B" stroke-width="1.6" stroke-linecap="round"/>`,
    metaTitle: 'AI Reception & Websites for Clinics | ReadyStack',
    metaDescription: 'A gap left by a no-show cannot be sold twice. AI reception, reminders and after-hours booking for Australian physios, chiros, dentists and psychologists.',
    heroTitle: 'Fewer no-shows, and a front desk that is <span class="text-amber">free again</span>',
    heroSub: 'Your reception is one person, and the phone rings anyway. An agent picks up mid consult, reminders go out the night before, and the site keeps taking bookings long after you have locked up.',
    painPoints: [
      { t: 'The gap where a booking used to be', d: 'A late cancellation on a Thursday afternoon is clinic time you cannot sell twice. Ringing down a waitlist between patients is the job nobody has time for, so the room sits empty and the practitioner does paperwork.' },
      { t: 'Your receptionist is on hold, not on the desk', d: 'One caller moving an appointment can hold up the front desk while three patients wait to be checked in. Everything that keeps the day running stops for the phone.' },
      { t: 'People book clinics at nine at night', d: 'A back that has been getting worse all week does not wait for business hours. If a Melbourne physio down the road takes that booking online at nine at night and you take a message at nine the next morning, the patient is already theirs.' },
    ],
    scenario: {
      heading: 'A Thursday, 8:15pm',
      body: 'A patient in Adelaide gets home from work with a shoulder that has been getting worse since Monday and searches for a physio near her. She lands on your site, reads that you treat shoulders, and asks whether there is anything before the weekend. The agent offers Friday at 7:30am from the times your clinic has open, takes her name and number, asks whether she has been in before, and books her. Your practice manager unlocks the door at seven and the appointment is already in the diary. Nobody rang anybody back.',
    },
    services: [
      { t: 'An agent that answers while you are with a patient', d: 'It picks up every call, including the ones that land mid consult, and handles the rebookings, the fee questions and the where do I park questions your front desk answers all day.' },
      { t: 'Reminders and waitlist calls that keep the diary full', d: 'A custom agent runs the confirmations your front desk never gets to, gives patients a way to reschedule rather than simply not arrive, and starts working the waitlist the moment a slot frees up.' },
      { t: 'Booking that stays open after hours', d: 'Patients book from your site at any hour, on a phone, without an account and without waiting for someone to be free to answer.' },
      { t: 'A website that reads like a clinic', d: 'Your practitioners and their registrations, the conditions you actually treat, your fees and rebates, and where to park. Built to load fast, because most of your patients arrive on a phone.' },
      { t: 'Found on Google and in AI answers', d: 'Pages that name the problems people actually search for, a Google Business Profile carrying the right categories, hours and rebate details, and appointment information written so an assistant has something to quote when a patient in Sydney asks who treats shoulders nearby.' },
    ],
    faqs: [
      { q: 'Is patient information safe with an AI receptionist?', a: 'It takes only what your front desk would take over the counter: a name, a number, and what the appointment is for. It has no connection to your clinical records, it is not somewhere to leave a health history, and it is written to move anything of that kind back to a practitioner rather than write it down. Call and message summaries go by email to the people you nominate and nowhere else, so nothing is published and nothing travels outside the clinic.' },
      { q: 'Will it give patients medical advice?', a: 'No. It does not diagnose, it does not triage, and it will not tell anyone whether a symptom is serious or urgent. It answers the practical questions, like whether you treat that kind of problem, what a first appointment costs and how long it runs, then books the appointment. Anything clinical goes to a practitioner. If a caller describes an emergency it tells them to call 000 and goes no further.' },
      { q: 'Can it really cut no-shows?', a: 'That is the job the reminder and waitlist agent is built for. It confirms the day before, gives the patient an easy way to move rather than vanish, and offers the freed slot to the people who asked to be called. We will not quote you a number we cannot stand behind. We build it around how your clinic runs and you watch what it recovers.' },
      { q: 'We already use practice management software. Does this replace it?', a: 'No, and it should not. Your practice software stays exactly where it is. The agent sends patients into the booking you already run, and where it cannot complete something it takes the details and passes them to the front desk so nothing rings out into a message bank. What it books directly and what it hands over is one of the first things we settle at setup.' },
      { q: 'How long until it is live?', a: 'A clinic site is usually ready to review inside one to two weeks once we have practitioner details and photos. The reception agent takes a few days on top of that, most of it spent teaching it your appointment types, your fees and the twenty questions your front desk answers every week.' },
    ],
    cities: ['Melbourne', 'Sydney', 'Adelaide'],
  },
  {
    slug: 'beauty-wellness',
    name: 'Beauty & Wellness',
    navLabel: 'Beauty & Wellness',
    trades: ['hair salons', 'beauty salons', 'day spas', 'massage therapists', 'nail technicians'],
    cardPromise: 'Hair salons, day spas and nail technicians: take the booking without putting the client down.',
    icon: `<circle cx="7.5" cy="19" r="2.6" stroke="#F59E0B" stroke-width="1.4" fill="none"/><circle cx="18.5" cy="19" r="2.6" stroke="#F59E0B" stroke-width="1.4" fill="none"/><path d="M9.2 16.9L19.5 4.5M16.8 16.9L6.5 4.5" stroke="#F59E0B" stroke-width="1.4" stroke-linecap="round"/><circle cx="13" cy="13.2" r="1.1" fill="#F59E0B"/>`,
    metaTitle: 'Salon & Spa Websites With 24/7 Booking | ReadyStack',
    metaDescription: 'Booked out and cannot pick up? We answer the phone, the chat and the late DMs for Australian hair salons, day spas and nail technicians, and fill the gaps.',
    heroTitle: 'Bookings that keep coming while your <span class="text-amber">hands are full</span>',
    heroSub: 'Nine hours on the floor and the enquiries do not stop for any of it. The phone, the website chat and the message that lands at eleven at night all get answered, priced and booked before you finish the blow-dry.',
    painPoints: [
      { t: 'The phone goes while you are mid colour', d: 'You cannot stop halfway through a foil to take a booking. It rings out, the caller tries the salon two doors down, and you never find out it happened.' },
      { t: 'The enquiry that came in at 11pm', d: 'A lot of the questions you get arrive after close, on Instagram, asking what a balayage costs and how long it takes. By the time you are at the basin the next morning they have booked somewhere that replied.' },
      { t: 'A cancellation at 9am leaves a hole at 11', d: 'One text saying they cannot make it and there is a two hour hole in the middle of the day. Filling it means ringing regulars between clients, which is exactly when you have no hands free.' },
      { t: 'The grid has not moved in six weeks', d: 'People look at your feed before they book, and a quiet account reads as a quiet salon. Shooting and posting properly is real work, and it is the first thing dropped when the day runs long.' },
      { t: 'Nobody can find what anything costs', d: 'Someone new looking for a day spa in Brisbane wants to know what a 60 minute massage runs to before they call. If your prices live in a link tree or nowhere at all, they keep scrolling.' },
    ],
    scenario: {
      heading: 'A Sunday, 10:20pm',
      body: 'A woman on the Gold Coast is on the couch scrolling and decides she wants her colour done before a wedding on Saturday. She finds you on Instagram, taps through to the site, and asks whether a colourist is free before the weekend and what a half head of foils costs. The agent gives her your price, offers Thursday at 2pm or Friday at 9am, takes her number, and books Thursday. Your senior stylist opens the diary on Monday to a new client already in it, from a message that would otherwise have sat unread until Tuesday.',
    },
    services: [
      { t: 'An agent that books while your hands are full', d: 'It answers the phone and the website chat around the clock, knows your service list and how long each treatment takes, and puts new clients into the diary instead of into a voicemail box.' },
      { t: 'Reminders and a waitlist that fill the gaps', d: 'A custom agent chases the confirmation the night before, so a wobble becomes a reschedule instead of an empty chair. When a gap does open it goes straight back out to the clients who wanted that time and could not get it.' },
      { t: 'Social content so the feed stays alive', d: 'Branded posts and captions written from your work and scheduled for you. You approve the month before anything goes out, so the account a new client checks looks like a salon that is busy.' },
      { t: 'A website with your prices on it', d: 'Your treatment menu, what each one costs, your team and your room, on a page that loads fast on a phone. It is also what shows up when someone searches for a hair salon in Melbourne on their lunch break.' },
    ],
    faqs: [
      { q: 'We already take bookings in an app. Why add an agent?', a: 'Because the enquiry comes before the booking. People want to know what a treatment costs, how long it takes and whether you can fit them in before Saturday, and a booking app answers none of that. The agent does, then sends them into the app you already use. It covers the exact step where new clients give up.' },
      { q: 'Will clients know they are talking to an AI?', a: 'Yes, and we write it so that is not a problem. It uses your salon name, it sounds like your front desk, and it says it is an assistant when it is asked. What people actually care about is getting a real answer at ten at night instead of a read receipt.' },
      { q: 'Who makes the social posts?', a: 'We do. We write the captions, brand the posts and schedule them, working from the photos you already take on your phone between clients. You see the month and approve it before anything is published.' },
    ],
    cities: ['Brisbane', 'Gold Coast', 'Melbourne'],
  },
  {
    slug: 'hospitality',
    name: 'Hospitality',
    navLabel: 'Cafes & Hospitality',
    trades: ['cafes', 'restaurants', 'bars', 'caterers'],
    cardPromise: 'Cafes, restaurants and caterers: be the place that comes up when somebody nearby is deciding where to eat.',
    icon: `<path d="M4.5 10h13.5v6a5 5 0 01-5 5h-3.5a5 5 0 01-5-5v-6z" stroke="#F59E0B" stroke-width="1.4" fill="rgba(245,158,11,.08)" stroke-linejoin="round"/><path d="M18 11.5h1.6a2.5 2.5 0 010 5H18" stroke="#F59E0B" stroke-width="1.4" stroke-linecap="round"/><path d="M9 6.8c0-1.1 1.1-1.6 1.1-2.8M13.4 6.8c0-1.1 1.1-1.6 1.1-2.8" stroke="#F59E0B" stroke-width="1.3" stroke-linecap="round"/><path d="M3.5 23.5h16" stroke="#F59E0B" stroke-width="1.4" stroke-linecap="round"/>`,
    metaTitle: 'Websites & Social for Cafes & Restaurants | ReadyStack',
    metaDescription: 'Social content, websites and AI booking for Australian cafes, restaurants, bars and caterers. Get found nearby and never lose a function enquiry.',
    heroTitle: 'Keep the feed alive and the functions <span class="text-amber">booked</span>',
    heroSub: 'The best enquiry of the week lands mid service and nobody sees it until Monday. We keep you visible, keep the menu readable, and keep the enquiries answered while the pass is on.',
    painPoints: [
      { t: 'The function enquiry lands mid service', d: 'A table of thirty for a birthday in three weeks is the best email you will get all week, and it arrives at quarter past seven on a Friday. By the time it is opened on Monday the organiser has booked the venue that answered on Saturday.' },
      { t: 'Your menu is a photo of a PDF', d: 'Somebody standing on the footpath cannot pinch and zoom their way through it, and they cannot tell whether you do anything gluten free. They walk to the next window and read that one instead.' },
      { t: 'You are invisible to the person a block away', d: 'Most people choose where to eat by searching from wherever they are standing. Old hours, three photos and a menu link that goes nowhere keeps you out of that decision no matter how good the food is.' },
      { t: 'The last post was a Christmas special', d: 'A feed that stopped in December reads as a venue that might have closed. Keeping it moving means shooting and writing on a day you are already short one on the floor.' },
    ],
    scenario: {
      heading: 'A Friday, 7:15pm',
      body: 'Service is on, both chefs are heads down, and an email arrives asking whether the back room is free on the 22nd for a work lunch, twenty two people, from an office five minutes away in Melbourne. Nobody is opening that until Sunday. With the agent in place it is answered inside a minute: the room seats twenty five, here is the set menu and the minimum spend, and these are the two dates still open. It takes the organiser name and number and pencils it in. Your manager reads the whole exchange over coffee on Saturday and all that is left to do is confirm.',
    },
    services: [
      { t: 'Social content that runs without you', d: 'A month of branded posts written from your specials, your room and your people, scheduled and posted for you. You approve the lot before it goes live, so the feed somebody checks at six looks like a venue that is open and busy.' },
      { t: 'A website with a menu people can actually read', d: 'Real text on the page rather than a photo of a PDF, so it loads in seconds on a phone, works for anyone checking dietary options, and can be changed the morning you change a dish.' },
      { t: 'Found on Google and in AI answers', d: 'Hours, photos, location and a menu link that resolves, all wired into the listing people read on the footpath before they decide. Written so that when somebody in Sydney asks an assistant where to eat nearby, there is something about your venue worth repeating back.' },
      { t: 'An agent for bookings and function enquiries', d: 'It picks up the phone and the site chat straight through service, handles the questions about room sizes, set menus and minimum spends, and takes the details on anything that needs your manager.' },
    ],
    faqs: [
      { q: 'We use a booking platform already. Where does an agent fit?', a: 'On everything the platform does not touch. Table bookings can keep flowing exactly as they do now. The agent takes the calls and messages around them: whether you do a set menu for fifteen, whether the courtyard is covered, whether a cake can be brought in. Those enquiries are the ones that turn into the big bookings, and they are the ones going unanswered during service.' },
      { q: 'Who takes the photos for the social posts?', a: 'Most venues send us what they already shoot on a phone and we do the writing, the branding and the scheduling. If what you have is not usable we will say so rather than post something that makes the food look worse than it is.' },
      { q: 'How fast can the menu be changed?', a: 'Same day. Because the menu is text on the page and not an uploaded file, changing a dish or a price is a small edit, and it is covered by monthly care rather than billed as a job.' },
    ],
    cities: ['Melbourne', 'Sydney'],
  },
  {
    slug: 'real-estate',
    name: 'Real Estate & Property',
    navLabel: 'Real Estate & Property',
    trades: ['sales agents', 'property managers', 'strata managers'],
    cardPromise: 'Sales agents and property managers: be the one who answers first, including at ten on a Saturday night.',
    icon: `<path d="M3.5 12.4L13 4l9.5 8.4" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 11.6V21a1 1 0 001 1h12a1 1 0 001-1v-9.4" stroke="#F59E0B" stroke-width="1.4" fill="rgba(245,158,11,.08)" stroke-linejoin="round"/><path d="M10.8 22v-5.4a2.2 2.2 0 014.4 0V22" stroke="#F59E0B" stroke-width="1.4" stroke-linejoin="round"/>`,
    metaTitle: 'AI Reception for Real Estate Agencies | ReadyStack',
    metaDescription: 'Appraisals at eleven on a Saturday, maintenance at nine at night: an AI receptionist that answers both, for Australian sales agents and property managers.',
    heroTitle: 'The agency that answers first wins the <span class="text-amber">listing</span>',
    heroSub: 'Saturday morning is opens, Saturday afternoon is paperwork, and the appraisal enquiry that came in at eleven goes to whoever rings back first. We make sure that is you.',
    painPoints: [
      { t: 'Every enquiry lands while you are standing at an open', d: 'Ten until one on a Saturday is when buyers ring, and it is the exact window you spend holding a folder open at a front door. The calls stack up and the callbacks start on Sunday night.' },
      { t: 'Maintenance does not keep office hours', d: 'A hot water system goes in a rental at nine at night. The tenant rings the office, hits a message bank, rings again at seven the next morning angry, and the owner hears about it from the tenant before they hear about it from you.' },
      { t: 'An appraisal goes to whoever replies first', d: 'An owner in Perth watching the neighbours sell contacts three agencies on a Sunday night. Two of them ring back Monday afternoon. The one that answered within the hour has the appraisal booked, and the other two are pitching against a decision already made.' },
    ],
    scenario: {
      heading: 'A Saturday, 11:05am',
      body: 'You are at an open home in Sydney with eleven groups through the door and your phone on silent in your jacket. A vendor two suburbs over, who has just watched the place across the road sell, rings the office number to ask what hers would go for. The agent picks up, takes the address, asks how many bedrooms and whether she has a timeframe, explains how your appraisals work, and books her for Tuesday at 4pm. You read the summary in the car between opens and ring her back already knowing the street.',
    },
    services: [
      { t: 'An agent that answers when the office cannot', d: 'Nights, weekends and the middle of an open. It answers buyer questions on a listing, takes appraisal enquiries with the address and the timeframe, and logs a maintenance report with the property, the tenant and how urgent it is, then sends each one to the right person.' },
      { t: 'A website that is yours, not the portal', d: 'Your listings, your team and the record of what you have actually sold, so an owner comparing agencies lands on you instead of a portal page that lists your competitors down the side of it.' },
      { t: 'Found on Google and in AI answers', d: 'Suburb by suburb, the areas you genuinely sell in each get a page of their own, a Google Business Profile that is filled in rather than claimed and forgotten, and enough readable detail about the agency that an assistant asked for a property manager in Brisbane has your name to hand over.' },
    ],
    faqs: [
      { q: 'What does the agent do with an urgent maintenance call at midnight?', a: 'It takes the property address, the tenant name and number and what has happened, then follows the rule you set. For a burst pipe or no hot water that usually means messaging the property manager on call immediately and telling the tenant who is coming and roughly when. For anything that can wait until Monday it logs the job, and the tenant goes to bed knowing it has been logged instead of wondering.' },
      { q: 'Can it put a price on a property?', a: 'Not a valuation, and you would not want it to. It can repeat the advertised price or range on a current listing because that is already published. For anything else it takes the details and books the appraisal. Putting a number on a home is your job, and it is the whole reason they rang.' },
      { q: 'Head office supplies our website. Can you still help?', a: 'Yes. Plenty of agencies are stuck on a franchise site they are not allowed to change. The agent sits on top of whatever you have, and we can build the pages the corporate template never gives you, like real suburb pages and a property management page that actually sells the service.' },
      { q: 'Do enquiry details get lost inside the agent?', a: 'No. Every call and chat ends with a written summary in your inbox: who rang, their number, the property and what they wanted. Sales enquiries go to the listing agent, maintenance goes to property management. Nothing lives only inside the agent.' },
    ],
    cities: ['Sydney', 'Brisbane', 'Perth'],
  },
  {
    slug: 'professional-services',
    name: 'Professional Services',
    navLabel: 'Professional Services',
    trades: ['accountants', 'lawyers', 'bookkeepers', 'mortgage brokers'],
    cardPromise: 'Accountants, lawyers and mortgage brokers: look as established as you are, and stop losing intake to a ringing phone.',
    icon: `<rect x="3" y="8" width="20" height="13.5" rx="2.5" stroke="#F59E0B" stroke-width="1.4" fill="none"/><path d="M9.5 8V6a2 2 0 012-2h3a2 2 0 012 2v2" stroke="#F59E0B" stroke-width="1.4" stroke-linejoin="round"/><path d="M3 13.6h20" stroke="#F59E0B" stroke-width="1.4"/><rect x="10.9" y="11.9" width="4.2" height="3.6" rx="1" stroke="#F59E0B" stroke-width="1.3" fill="rgba(245,158,11,.08)"/>`,
    metaTitle: 'Websites & AI Intake for Professional Firms | ReadyStack',
    metaDescription: 'Websites, search visibility and AI intake for Australian accountants, lawyers, bookkeepers and mortgage brokers. Look established, keep billing.',
    heroTitle: 'Look as established as you <span class="text-amber">already are</span>',
    heroSub: 'Most of the decision is made before the phone rings. Your website has to win that part on its own, and an intake agent takes it from there, qualifying the matter and booking it while you are still in a meeting.',
    painPoints: [
      { t: 'You look smaller than you are', d: 'A twelve year old firm with three partners and a site built on a free template reads as a side business. The prospect who was referred to you checks anyway, and the check is where you lose them.' },
      { t: 'Intake calls land in the middle of billable work', d: 'A new enquiry is always worth taking, and it always arrives two hours into a return or a day before a filing deadline. Answering costs you the thread. Not answering costs you the client.' },
      { t: 'Tax time outruns the phone', d: 'For a few weeks a year the enquiries come in faster than anyone can pick up, and almost every one is a first contact from somebody who will simply ring the next firm on the list.' },
      { t: 'The enquiry form asks for everything and gets nothing', d: 'Nine fields, a captcha and no sign of what happens next. People who would have spent two minutes on the phone with you abandon the form instead, and you never know they were there.' },
      { t: 'Referrals look you up before they call', d: 'Whoever sent them has done the selling for you. What decides it is what they find when they search your name at ten on a Sunday, and for a lot of firms that is one profile page and a phone number.' },
    ],
    scenario: {
      heading: 'A Wednesday in July, 7:50pm',
      body: 'A contractor in Canberra with three years of returns unlodged has finally decided to deal with it. He searches, opens two firms, and starts with yours because your site says plainly that you handle exactly this. The agent asks what he needs, how many years are outstanding, whether he is a sole trader, and whether he would rather come in or do it by phone. It books him for Thursday at 4pm and tells him what to bring. The other firm has a contact form he did not fill in.',
    },
    services: [
      { t: 'A website that carries the trust', d: 'Plain about what you do and who you do it for, with your people, your qualifications and your registrations where a prospect can see them without hunting. Fast to load, and written to read like a firm rather than a template.' },
      { t: 'Found on Google and in AI answers', d: 'One page for each piece of work you want more of, a Google Business Profile that matches your registrations, and answers written plainly enough that an assistant can lift them when somebody in Melbourne describes their situation to ChatGPT instead of searching for a bookkeeper at all.' },
      { t: 'An intake agent that protects billable hours', d: 'It answers the calls you cannot, asks the qualifying questions you would ask, filters out the matters that are not for you, and books the ones that are. You come out of a meeting to a booked diary and a written brief.' },
      { t: 'Monthly care and content', d: 'Updates, backups, uptime and speed handled without you logging in, plus a monthly article answering the questions clients keep asking. That is what keeps a firm climbing in search instead of standing still.' },
    ],
    faqs: [
      { q: 'Is what a client tells the agent confidential?', a: 'The agent sits at the point before you have taken anything on, and it is built to stay there. It gathers enough for a partner to decide whether the matter is yours: who is calling, how to reach them, and broadly what it concerns. Documents, account numbers and the detail of a dispute it declines and holds over for your first real conversation, which is also where privilege and your engagement terms start doing their work. Transcripts land in the inboxes you specify and nowhere outside the firm.' },
      { q: 'Will it give legal or financial advice?', a: 'No, and that is fixed in how we build it. It does not advise on a matter, it does not tell anyone what they can claim or what they can borrow, and it does not comment on the merits of a case or an application. It explains what your firm does, what an initial consultation costs and how long it takes, then books the appointment. The advice is yours to give.' },
      { q: 'Can it help with conflict checks?', a: 'It can collect what you need to run one, such as the other parties involved, and flag it at the top of the summary. The check itself stays with you. We also word it so that nothing in the conversation implies you have accepted the engagement, and the caller is told plainly that the matter is not on foot until your firm confirms it.' },
      { q: 'Can it cope with the tax time spike?', a: 'That is where it pays for itself. It takes as many callers at once as ring in, at eleven at night and at seven the next morning, and it is no worse at four in the afternoon on the twentieth straight day. It will not decide which jobs are worth taking, but none of them will ring out while you decide.' },
      { q: 'How long does a firm website take?', a: 'One to three weeks for most firms, in Sydney and everywhere else, depending on how quickly bios, photos and your service list come back to us. The intake agent is scoped alongside the build, and we do not switch it on until you have listened to it handle your own questions.' },
    ],
    cities: ['Sydney', 'Melbourne', 'Canberra'],
  },
];
