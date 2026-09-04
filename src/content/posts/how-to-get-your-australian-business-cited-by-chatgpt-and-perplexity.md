---
title: How to Get Your Australian Business Cited by ChatGPT and Perplexity
publishedDate: 2026-09-05
updatedDate: 2026-09-05
excerpt: More Australians are asking AI assistants for recommendations instead
  of searching Google. Here's the practical, technical foundation that makes
  your business the one ChatGPT, Perplexity, and Google AI Overviews cite.
coverImage: /images/posts/get-citedby-ai.png
draft: false
---
Someone in Sydney needs a conveyancer. Two years ago they typed "conveyancer near me" into Google and scrolled the results. Today, a growing number of them open ChatGPT or Perplexity and ask "who's a good conveyancer in the Inner West?" and act on the two or three names the AI gives back.

If your business isn't one of those names, you never even entered the running. There's no page two to scroll to. The AI picks a handful of businesses, cites them, and the conversation moves on.

Getting cited by AI assistants is a learnable, mostly technical process, and right now very few Australian businesses are doing it. That gap is the opportunity. This post explains exactly how the citing works and what you need to have in place, in plain terms.

We build this foundation into every site we make, so what follows is what we actually implement, not theory.

---

## First, understand how AI assistants choose who to cite

AI assistants pick businesses to mention in one of two ways, and knowing which is which changes what you do.

Some assistants answer from what they learned during training. This is slow-moving and hard to influence directly, and it favours businesses with a large, consistent presence across the web.

More importantly, the tools people use for local recommendations (Perplexity, ChatGPT with browsing, Google AI Overviews, Claude with search) increasingly answer by searching the live web at the moment you ask, then summarising what they find and citing their sources. This is the part you can influence, and it's the part that matters for a local Australian business.

So the goal is straightforward to state: when an AI searches the web for "good conveyancer Inner West Sydney", your site needs to be findable, readable by machines, and structured so the AI can extract a clear answer about who you are and what you do. Everything below serves that goal.

---

## The foundation: be findable and fast

None of the AI-specific work matters if the basics aren't there. AI systems lean heavily on conventional search infrastructure to find candidates in the first place.

That means your site needs to be indexed and reasonably well ranked for the things you do, load quickly, work on mobile, and use clean, semantic HTML. A slow, messy, or poorly structured site is hard for both Google and AI crawlers to make sense of.

If your traditional SEO is weak, fix that first. AI visibility is built on top of search visibility, not instead of it. The good news is that most of the work below improves both at once.

---

## Step 1: Let AI crawlers in

This is the step that trips up the most Australian businesses, and it's invisible unless you go looking.

AI companies use named crawlers to read the web: GPTBot and ChatGPT-User from OpenAI, ClaudeBot from Anthropic, PerplexityBot from Perplexity, Google-Extended from Google, and several others. Your site tells these crawlers whether they're welcome through a small file called robots.txt.

Many sites accidentally block them. Some do it through an overzealous security plugin. Some are on platforms that block AI bots by default. If your robots.txt disallows these crawlers, you have made yourself invisible to AI search, and almost nobody realises they've done it.

What you want is a robots.txt that explicitly allows the major AI crawlers alongside the normal search engines, and points them to your sitemap. The crawlers to name include GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, and CCBot, among others.

A specific warning for anyone on Cloudflare, which is a large share of Australian sites. Cloudflare has settings that block AI crawlers by default, and these can override your own robots.txt. If you're on Cloudflare, check two settings: set "Manage robots.txt" so Cloudflare isn't managing (and overriding) yours, and set "Block AI training bots" to not block. Otherwise you can do everything else in this post perfectly and still be invisible, because the gate is shut upstream.

How to check your own site: open yoursite.com.au/robots.txt in a browser and read it. If you see the AI crawler names under a "Disallow" rule, or if the file blocks everything, that's your first fix.

---

## Step 2: Add an llms.txt file

There's an emerging convention called llms.txt, a file that lives at yoursite.com.au/llms.txt and gives AI systems a clean, plain-text summary of your business.

Think of it as a briefing document written for machines. Where your homepage is designed for humans, with images and navigation and marketing language, llms.txt is a stripped-back markdown file that states clearly what your business is, what services you offer, where you operate, your pricing shape, and how to contact you.

It's a young standard and not every AI system reads it yet, but it costs almost nothing to add, it can only help, and it forces you to articulate your business in the clear, factual terms AI systems prefer. We add one to every site as standard.

A good llms.txt for an Australian business includes a one-line description of what you do, your location and service area stated plainly, a list of services, an indication of pricing, and your contact details. Written the way you'd brief someone who had thirty seconds to understand your business.

---

## Step 3: Structured data (the single biggest technical lever)

This is where most of the real advantage is won, and where most Australian small businesses do nothing.

Structured data, also called schema markup, is invisible code that labels the information on your page so machines can read it unambiguously. Instead of an AI having to guess that "Call us on 02..." is your phone number and "Serving the Inner West" is your service area, structured data states it outright in a format built for machines.

For a local Australian business, the schema types that matter most are LocalBusiness or a more specific type like ProfessionalService, which lets you declare your name, address, phone, service area, opening hours, and geographic coordinates. Organization schema establishes your business identity. FAQPage schema, added to a page with genuine questions and answers, is especially powerful because it maps directly onto how people ask AI assistants questions.

The payoff is direct. When an AI extracts information about your business, structured data hands it clean, confident, unambiguous facts instead of making it interpret marketing copy. Businesses with proper schema get represented more accurately and cited more readily. This is a one-time setup with an indefinite payoff, and it improves your standing in traditional Google results at the same time.

---

## Step 4: Write content the way people ask questions

AI assistants are queried in natural language. People type "how much does a will cost in NSW" into ChatGPT, not "will cost NSW". Your content should match that reality.

The practical shape of this: use real questions as your headings, and answer each one clearly in the first sentence or two beneath it, before you elaborate. An AI extracting an answer wants a clean, self-contained response it can lift and cite. Burying the answer three paragraphs into a section, or never quite stating it plainly, means the AI moves on to a competitor who did state it.

An FAQ section on your key pages does a lot of work here. So does structuring service pages around the questions a real customer asks: what it costs, how long it takes, what's included, what happens next. Short, self-contained paragraphs extract better than long winding ones, because the meaning survives being pulled out of context.

This is also just good writing for humans. Content that answers questions directly serves your actual customers as well as the machines summarising it for them.

---

## Step 5: Be consistent everywhere else

AI systems build confidence in facts they see repeated consistently across the web. Your business name, address, and phone number should match exactly across your website, your Google Business Profile, and any directories you appear in. Inconsistency (an old address here, a different phone format there) makes AI systems less certain about you, and less likely to cite you confidently.

Your Google Business Profile deserves particular attention, because AI systems, including Google's own, draw on it heavily for local recommendations. A complete, accurate, well-categorised profile with reviews feeds directly into how you're represented in AI answers about your area.

Beyond that, genuine mentions of your business on other reputable sites (a local publication, an industry body, a real partner) build the web-wide presence that AI systems weigh. This is slower work, but it's the same activity that has always built real authority.

---

## How to check whether it's working

The most direct test costs nothing: ask the AI assistants yourself. Open ChatGPT, Perplexity, Google's AI Overviews, and Claude, and ask the questions a customer would ask to find a business like yours. "Best [your service] in [your suburb]". See who gets named. If it's your competitors, you now know exactly where you stand.

Repeat this periodically. As you implement the steps above, and as the AI systems recrawl your improved site, you should see your position change. It isn't instant, because the systems need to re-read your site and rebuild their picture of you, but the direction of travel becomes clear over weeks, not months.

Also check Google Search Console, which increasingly reports on how your site appears in AI-influenced search surfaces, and watch for referral traffic from AI tools in your analytics, which is a growing and very trackable source.

---

## Frequently asked questions

### What is GEO or generative engine optimisation?

Generative engine optimisation is the practice of structuring your website and its content so that AI assistants like ChatGPT, Perplexity, and Google AI Overviews can find, understand, and cite your business in their answers. It overlaps with traditional SEO but adds specific requirements around machine-readable structure and AI crawler access.

### How do I know if ChatGPT or Perplexity can see my website?

Two checks. First, open yoursite.com.au/robots.txt and confirm the AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others) are not blocked. Second, ask the assistants directly about a business like yours and see whether you're mentioned. If you're on Cloudflare, also check that its AI-bot-blocking settings aren't overriding your robots.txt.

### Do I need to be blocked or allowed by AI crawlers?

To be cited, you need to be allowed. Some businesses deliberately block AI crawlers to protect content, but if your goal is to be recommended by AI assistants, blocking them guarantees you won't be. For most service businesses, allowing them is the right choice.

### What is an llms.txt file and do I need one?

llms.txt is a plain-text markdown file at your site's root that summarises your business for AI systems in clear, factual terms. It's an emerging standard not yet read by every AI tool, but it's low-effort to add and can only help. We include one on every site we build.

### How long does it take to start appearing in AI answers?

There's no fixed timeline, because it depends on how often the AI systems recrawl your site and rebuild their understanding of it. After implementing the technical foundation, changes typically become visible over a period of weeks as the systems re-read your improved site, provided your underlying search visibility is sound.

### Is AI visibility replacing traditional SEO?

No, it's built on top of it. AI systems rely heavily on conventional search infrastructure to find candidate businesses in the first place. Weak traditional SEO undermines AI visibility. The two are complementary, and most of the work for one improves the other.

---

## The window is open right now

The reason this is worth doing today rather than next year is simple. Most Australian small businesses have done none of it. Their robots.txt quietly blocks AI crawlers, they have no structured data, their content buries answers, and they've never once asked ChatGPT what it says about their industry in their suburb.

That means the businesses that put this foundation in place now get cited while their competitors are invisible. It's the closest thing to an unfair advantage available in Australian small business marketing this year, and it's mostly a one-time technical job rather than an ongoing spend.

At ReadyStack Digital we build this foundation (AI crawler access, structured data, llms.txt, question-structured content, and the Cloudflare settings that quietly break it) into every website we make for Australian professional services. If you'd like to know how your current site is positioned for AI search, [get an instant estimate](https://readystackdigital.com/estimate) or [book a free strategy call](https://readystackdigital.com/contact).