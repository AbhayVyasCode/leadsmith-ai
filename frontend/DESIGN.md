# DESIGN.md — Leadsmith AI marketing website

> Contract produced by `hyperstack:designer` (MCP-grounded, not memory). **A complete remake of the marketing site.**
> All implementation reads from this file. **No visual code deviates from this without updating this file first.**
> Brand name on the site is always **"Leadsmith AI"** (never "Leadsmith", "discovr", or "LeadSmith").

---

## 0. Scope, stack & what changed

- **Product:** Leadsmith AI — a free, multi-agent, Gemini-powered B2B lead-discovery engine. Plain-English request → a supervisor orchestrates specialized agents (**intent → discovery → qualify → critic → enrich → outreach**) → ranked leads, each with the **evidence behind its score**, plus a **live agent-trace** and run metrics.
- **This remake covers the MARKETING SITE ONLY.** The `/app` workspace dashboard is **out of scope** and stays as-is. Marketing pages may *showcase* the app via polished static mockups.
- **Pages (11 routes):** `/` Home · `/product` · `/how-it-works` · `/use-cases` · `/about` · `/blog` (index) · `/blog/[slug]` (article) · `/faq` · `/contact` · `/privacy` · `/terms` · plus a branded `not-found` (404).
- **No pricing page** this round (product is free; CTAs go to the app).
- **Theme:** full **light + dark**, both **first-class** with WCAG-tested contrast. (The old contract was "dark-first, ship light"; now both modes are co-equal and the light mode is fully designed, not an inversion.)
- **Stack (fixed):** Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4 (OKLCH tokens in `app/globals.css`) · shadcn-style primitives on Radix (`components/ui/*`) · Motion (`motion/react`) · Lenis (landing smooth-scroll) · Lucide icons · next-themes · sonner.
- **Kept from the prior contract (proven, passes all anti-patterns):** the OKLCH 3-layer token architecture, signal-cyan accent, Geist type system, 4px/8px spacing rhythm, GPU-only motion + `prefers-reduced-motion`, the accessibility floor.
- **Added by this remake:** §1 Brand & Logo, §6 Marketing IA (multi-page nav/footer/mega-menu), §7 per-page blueprints with production copy, §12 copy & messaging library, co-equal light-mode polish, richer "premium" section layouts and depth.

---

## 1. Brand & Identity  *(NEW)*

### 1.1 Name & tagline
- **Name (always):** **Leadsmith AI**.
- **Tagline (brand line, primary):** **"Plain English to pipeline."**
- **One-liner (meta / hero support):** "Describe the companies you want in one sentence. A team of AI agents discovers, qualifies, and ranks real leads — with the evidence behind every score."
- **Naming story (drives the identity):** a *smith* forges raw material into something refined and useful. **Leadsmith AI forges a sentence of intent into a qualified pipeline.** The visual identity fuses two ideas: the **forge spark** (the moment of creation) and the **signal node** (data / the agent graph).

### 1.2 Voice
- **Personality (constant):** plainspoken, precise, confident, technically credible, quietly opinionated. Never hypey, never "AI-magic" mysticism. We *show our work*.
- **Tone (varies by surface):** marketing = confident + concrete; docs/how-it-works = explanatory + calm; errors/empty = humane + helpful.
- **Rules:** sentence case everywhere. Grade 5–7 reading level. Max ~25 words/sentence. Concrete > vague ("scores every lead across 6 dimensions" beats "powerful scoring"). First-person CTAs. Active voice. No exclamation marks in body. No "revolutionary/seamless/cutting-edge" filler. Numbers are specific and honest (no fabricated metrics).

### 1.3 Logo specification *(build as crisp SVG; implement in `components/brand.tsx` + `public/`)*
**Concept — "The Forge Spark."** A geometric four-point spark with a **dominant vertical axis** (taller than wide, ~1 : 1.6) and a small **offset secondary spark** at the upper-right — reading simultaneously as a *struck forge spark*, an *AI sparkle made ownable*, and a *node in the agent graph*. Drawn on an 8px grid with optical centering. **Not** the generic symmetric 4-point AI sparkle, and **not** AI-purple.

- **Construction:** concave-curved 4-point star (subtle inward curve on the arcs, not straight diamond edges) so it feels "struck/energetic," not a plain rhombus. Vertical points longer than horizontal. The secondary mini-spark is ~32% scale, offset to ~1–2 o'clock, expressing "sparks fly."
- **Color treatment:** mark fill = vertical brand gradient **`oklch(0.74 0.13 210)` → `oklch(0.55 0.16 212)`** (azure→cyan, top→bottom). Monochrome fallback = `--primary`. On a tile (favicon/app icon): squircle (28% corner radius) tile in `--foreground`-dark charcoal `oklch(0.20 0.013 260)` with the cyan-gradient glyph; in light contexts the tile may be the cyan gradient with a near-white glyph.
- **Lockups:**
  1. **Glyph only** — nav, favicon, social avatar. Min size 16px (favicon) / 20px (nav).
  2. **Horizontal lockup** — glyph + wordmark. Default for nav-wide, footer, headers.
  3. **Stacked lockup** — glyph over wordmark. For og-image, 404, splash.
- **Wordmark:** "Leadsmith AI" in **Geist 600, tracking -0.03em**. "Leadsmith" in `--foreground`; **"AI" in `--primary`** (the only colored word) to brand the lockup and carry the accent. Optical kerning between glyph and wordmark = 0.5× cap-height.
- **Clearspace:** ≥ glyph height on all sides. **Don'ts:** never recolor to a non-brand hue, never add drop shadows/bevels, never stretch, never put the gradient glyph on a low-contrast cyan background, never set the wordmark in a different family.
- **Assets to produce:** `public/logo-mark.svg`, `public/logo-mark-mono.svg`, `public/logo-lockup.svg`, `public/favicon.svg`, `app/icon.svg` (Next metadata icon), `app/apple-icon.png` spec, `app/opengraph-image` (stacked lockup on charcoal with the signal-grid motif).

---

## 2. Visual Theme & Atmosphere

**Emotional target:** *premium, precise, trustworthy* — "engineered by people who care about every pixel; the data is the hero, and it shows its work."

**One-sentence test:** *A refined, fast, dual-mode analytics surface where every bit of motion or color explains what the agents are doing.*

- **Personality:** premium-precision (Linear / Vercel / Stripe lineage). Mono + single accent, surgical whitespace, near-zero decoration, structure from spacing not borders.
- **Identity carriers (must appear):** (a) the **signal-cyan** accent (one accent, everything else neutral); (b) **mono tabular numerals** for every score / metric / email; (c) the **agent-trace graph + live pipeline** as the product's signature visual; (d) the **forge-spark** mark.
- **"Premium" elevation for this remake (beyond the prior site):** larger fluid display type with word-stagger; layered depth via a subtle **signal-grid / aurora** background (opacity+transform only, paused off-screen); real **product mockups** of the app embedded in feature sections; asymmetric **bento** layouts (never a grid of identical cards); generous macro-whitespace (96px sections); hairline opacity borders + soft elevation. Restraint is the brand — no glassmorphism overload, no neon.

---

## 3. Color Palette (OKLCH — full tokens, both modes co-equal)
> Cool, committed neutral family (technical/analytics) with the accent carrying chroma. Neutrals are *intentionally* cool with a whisper of chroma — **not** dead `#F9FAFB`. Dark mode is a **redesign, not an inversion**: warmish-cool charcoal, progressively lighter surfaces per elevation, opacity-based borders. **Light mode is fully designed** (neutral-tinted soft shadows, hairline borders, layered surfaces). Verify in build via `design_tokens_generate` + contrast audit.

### Brand ramp — "signal" cyan-azure (hue ~210)
`50 .97 .02 210` · `100 .94 .04 210` · `200 .88 .07 210` · `300 .82 .10 210` · `400 .74 .13 210` · `500 .66 .15 210` · `600 .58 .15 211` · `700 .49 .13 212` · `800 .40 .10 213` · `900 .31 .07 214` · `950 .22 .05 215`

### Semantic tokens
| Token | Light | Dark | Contrast target |
|---|---|---|---|
| `--background` | `oklch(0.985 0.004 255)` | `oklch(0.165 0.012 260)` | dark = cool charcoal, not #000 |
| `--surface` (card) | `oklch(0.997 0.002 255)` | `oklch(0.205 0.013 260)` | elevation +1 |
| `--surface-2` (popover/elevated) | `oklch(1 0 0)` | `oklch(0.235 0.014 260)` | elevation +2 |
| `--foreground` | `oklch(0.205 0.02 260)` | `oklch(0.965 0.005 255)` | body ≥ 7:1 (AAA-leaning) |
| `--muted-foreground` | `oklch(0.505 0.02 260)` | `oklch(0.705 0.012 258)` | ≥ 4.5:1 both modes |
| `--border` | `oklch(0.205 0.02 260 / 0.12)` | `oklch(1 0 0 / 0.10)` | opacity-based hairline |
| `--input` | `oklch(0.205 0.02 260 / 0.16)` | `oklch(1 0 0 / 0.14)` | ≥ 3:1 UI |
| `--primary` | `oklch(0.55 0.16 211)` | `oklch(0.70 0.14 211)` | CTA bg |
| `--primary-foreground` | `oklch(0.99 0.01 210)` | `oklch(0.17 0.03 240)` | label on primary ≥ 4.5:1 |
| `--primary-soft` | `oklch(0.55 0.16 211 / 0.10)` | `oklch(0.70 0.14 211 / 0.14)` | tint bg for chips/eyebrows |
| `--ring` | `oklch(0.55 0.16 211)` | `oklch(0.72 0.14 211)` | focus ring |
| `--link` | `oklch(0.50 0.15 211)` | `oklch(0.80 0.12 210)` | ≥ 4.5:1 each mode |

### Status (each solid + soft; **never color-only** — always paired with value + icon/label)
| Token | Light solid | Dark solid |
|---|---|---|
| `--success` (score≥70 / verified email / accept) | `oklch(0.55 0.14 155)` | `oklch(0.72 0.15 155)` |
| `--warning` (score 40–69 / guessed email / weak) | `oklch(0.62 0.14 75)` | `oklch(0.78 0.15 78)` |
| `--danger` (score<40 / rejected / error) | `oklch(0.55 0.19 25)` | `oklch(0.70 0.18 25)` |
| `--info` | = primary | = primary |

### Chart tokens (Okabe-Ito, colorblind-safe — **separate from `--primary`**, max 8)
`--chart-1 .65 .13 215` · `--chart-2 .70 .14 150` · `--chart-3 .80 .14 85` · `--chart-4 .62 .17 35` · `--chart-5 .58 .18 25` · `--chart-6 .60 .16 330` · `--chart-7 .72 .10 230` · `--chart-8 .55 .02 260`

### Shadows / glow
- **Light:** neutral-cool-tinted, never pure black: `--shadow-1 0 1px 2px oklch(.2 .02 260/.06)` · `--shadow-2 0 4px 16px /.08` · `--shadow-3 0 12px 32px /.10`. Premium feel comes from soft, low-spread shadows + hairline borders.
- **Dark:** elevation via lighter surfaces; box-shadows only for layered overlays. Reserved **accent glow** on focal/active: `0 0 0 1px oklch(.70 .14 211/.4), 0 0 24px oklch(.66 .15 210/.18)`.
- **Gradient utility (brand):** hero/CTA may use a *subtle* radial/linear cyan wash at ≤ 14% opacity over the neutral bg. Never a full saturated gradient block.

---

## 4. Typography
- **Families (max 2):** `Geist` (sans, UI + display) · `Geist Mono` (numerals, scores, emails, IDs, code/draft blocks). System fallback stack always.
- **Numerals:** `font-feature-settings:"tnum" 1` (tabular) on all scores/metrics; right-aligned in tables.
- **Weights (premium restraint — no 700+):** body 400 · labels/buttons/medium 500 · headings 600.
- **Scale** (base 16px; ratio ~1.2 app, fluid display for marketing):

| Token | Size | LH | Tracking | Weight | Use |
|---|---|---|---|---|---|
| display-2xl | `clamp(2.75rem,6vw,5rem)` | 1.02 | -0.035em | 600 | home hero |
| display-xl | `clamp(2.5rem,5vw,4.5rem)` | 1.05 | -0.03em | 600 | page heros |
| display | `clamp(2rem,3.5vw,3rem)` | 1.1 | -0.025em | 600 | section headers |
| h1 | 2rem | 1.15 | -0.02em | 600 | page title |
| h2 | 1.5rem | 1.2 | -0.02em | 600 | |
| h3 | 1.25rem | 1.3 | -0.015em | 600 | |
| body-lg | 1.125rem | 1.6 | 0 | 400 | marketing prose, blog body (18px) |
| body | 1rem | 1.5 | 0 | 400 | default |
| body-sm | 0.875rem | 1.5 | 0 | 400/500 | captions, dense |
| overline | 0.75rem | 1.4 | +0.08em | 500 | uppercase eyebrows |
| mono-data | 0.875–1rem | 1.4 | 0 | 500 | scores, metrics, emails |

- Body **fixed** (no `clamp`); display headings **fluid**. Prose `max-width: 65ch` (blog/legal/about). Marketing section intros `max-width: ~52ch`.

---

## 5. Spacing & Grid
- **Base 4px; 8px rhythm:** `4 8 12 16 24 32 48 64 96 128`.
- **Density:** marketing = **comfortable** (section padding `96px` desktop / `64px` tablet / `56px` mobile; card padding 24–32px; body 16–18px). Embedded app mockups keep app density.
- **Grid:** 12-col, gutters 24px desktop / 16px mobile, margins 48–64px / 20px.
- **Content max-width:** page `1280px`; prose `65ch`; narrow CTA/forms `~32rem`.
- Spacing **within** groups < **between** groups (label↔input 6–8px; field↔field 20–24px; section↔section 96px). Vary spacing by context (no "24px everywhere").

---

## 6. Marketing Information Architecture  *(NEW)*

### 6.1 Sitemap
```
/                 Home (full story, single scroll)
/product          Product / Features — the multi-agent engine in depth
/how-it-works     The pipeline, step by step, with the live trace
/use-cases        Solutions by audience (founders · sales · agencies · recruiters …)
/about            Mission, story, principles
/blog             Resources index (cards + categories)
/blog/[slug]      Article (manuscript grid, 65ch)
/faq              Standalone, grouped FAQ
/contact          Contact + book-a-demo form
/privacy          Privacy policy (legal template)
/terms            Terms of service (legal template)
(not-found)       Branded 404
```

### 6.2 Primary navigation (sticky, glass-blur on scroll)
- **Left:** logo lockup (→ `/`).
- **Center/left links (desktop ≥ 1024px, all visible — no hamburger on desktop):** **Product** (mega-menu ▾), **How it works**, **Use cases**, **Blog**.
  - **Product mega-menu** (premium, on hover/focus, keyboard-accessible): two columns — *Capabilities* (Discovery, Qualifying & scoring, Evidence & critic, Enrichment, Outreach drafting, Live agent trace) each a link to a `/product#anchor`; *Resources* (How it works, Use cases, FAQ). A right rail teases "Open the app".
- **Right:** **theme toggle** (light/dark/system, persisted, no flash) · **Open the app** (primary button → `/app`). A subtle **Contact** ghost link may precede the toggle on ≥1280px.
- **Mobile (< 1024px):** logo + theme toggle + hamburger → **sheet** menu listing all links (Product sub-links flattened under a "Product" group), Contact, and a full-width "Open the app" CTA. A **sticky bottom CTA bar** ("Open the app") appears after the hero scrolls out (thumb-zone).
- **Active state:** current top-level link shown with `--foreground` + 2px under-accent; others `--muted-foreground`.
- **Sticky offset:** 64px header → `scroll-margin-top`/anchor offset on all in-page targets.

### 6.3 Footer (organized columns, not a dump)
- **Brand column:** stacked logo + tagline "Plain English to pipeline." + a one-line description + theme toggle.
- **Product:** Features, How it works, Use cases, Open the app.
- **Company:** About, Blog, Contact.
- **Resources:** FAQ, How it works, (status/changelog optional later).
- **Legal:** Privacy, Terms.
- **Bottom bar:** "� 2026 Leadsmith AI" � "Built for inspectable prospecting" � social icons (placeholder hrefs: X/LinkedIn/GitHub). Honest, minimal.

---

## 7. Page Blueprints  *(NEW — sections, components, and canonical copy)*
> Section ordering follows the Unbounce/NNG sequence. Every page: single primary CTA repeated; trust line near each CTA; honest copy (no fabricated customers/metrics). Reuse shared `Reveal`/`Stagger` scroll-reveals.

### 7.1 Home `/`
1. **Hero** � eyebrow chip `Multi-agent � Gemini`; **display-2xl** headline **"Find your next customers in plain English."** (word-stagger, reduced-motion-gated); subhead = the �1.2 one-liner; a **faux NL search field** cycling example queries with a blinking caret; CTAs **"Open the app ?"** (primary) + **"See how it works"** (ghost, ?/how-it-works); trust line **"Evidence-backed leads with inspectable reasoning."**; behind it the **signal-grid/aurora** bg; bleed 64px of next section. *(Above-fold value prop in 3s.)*
2. **Proof strip (honest)** — NOT fake logos. A row of product-truth pills: **"6-dimension scoring," "Evidence on every lead," "Adversarial critic," "No paid data APIs," "Live agent trace."** Optional small note: "Built on Google Gemini." Leave a commented `// real testimonials slot` for later.
3. **Problem** — "Prospecting is a research tax." Three pains: *hours lost to manual research · generic lists that don't fit · black-box tools you can't trust.* Sets up the solution.
4. **Features bento** — asymmetric bento (NOT identical cards): large tile = **"Describe your buyer in plain English"** with the search mockup; tile = **"A team of agents, not one prompt"** (mini pipeline visual); tile = **"Evidence behind every score"** (score ring + dimension bars mockup); tile = **"It shows its work"** (mini trace-graph); tile = **"Outreach, drafted for you"** (outreach card mockup). Each: icon + benefit headline + one-line "so what?".
5. **How it works (condensed)** — horizontal 6-step pipeline (intent→discovery→qualify→critic→enrich→outreach) with the live "lighting up" animation; CTA "See the full pipeline →".
6. **Use-cases teaser** — 4 persona cards (Founders, Sales/SDR, Agencies, Recruiters) → `/use-cases`.
7. **Transparency / trust** — "Free. Honest. Yours." block: free (Gemini), no paid data APIs, evidence-first, your data stays yours, open about limits.
8. **FAQ (top 5)** — accordion of the 5 highest-objection questions; link "See all FAQs →".
9. **Final CTA** — repeat hero CTA on a focal panel (subtle cyan wash / glow in dark): headline **"Describe your next customer. Meet your pipeline."**, button "Open the app →", trust line.
10. **Footer.**

### 7.2 Product `/product`
- **Hero:** eyebrow "Product"; headline **"A multi-agent engine that finds and qualifies your leads."**; subhead; CTA.
- **Agent sections (anchored, alternating left/right with mockups)** — one block per capability, each with an id matching the mega-menu: `#discovery`, `#qualify`, `#evidence` (critic), `#enrich`, `#outreach`, `#trace`. Each: overline (agent name), h2 benefit headline, 2–3 sentence explainer, a 3-bullet "what it does," and a polished **app mockup** (reuse app components as static visuals).
- **"Why multi-agent" band** — short rationale (specialized agents + adversarial critic = quality over a single mega-prompt).
- **Spec strip** — honest capability facts (mono numerals): dimensions scored, confidence model, email-confidence states, trace nodes, free tier "$0".
- **Final CTA + Footer.**

### 7.3 How it works `/how-it-works`
- **Hero:** "How Leadsmith AI works." subhead: "From one sentence to a ranked pipeline — and you can watch every step."
- **The 6 steps** — vertical numbered timeline; each step = overline `01 — Intent`, headline, explanation, input→output example (mono), and the agent-status pill states. Include the **trace graph** explanation (React Flow visual, static/animated).
- **"You can see everything"** — transparency section: dimension scores, critique verdicts, recalled RAG context, run metrics (LLM calls, tokens, est. cost = free).
- **Mini-FAQ (3)** + **Final CTA** + Footer.

### 7.4 Use cases `/use-cases`
- **Hero:** "Built for how modern teams actually prospect."
- **Persona sections** (4–6), each: who, the job-to-be-done, an example plain-English query (mono), what they get back, and a "so what" outcome. Personas: **Founders & GTM**, **Sales / SDR teams**, **Agencies & lead-gen**, **Recruiters & talent**, **Investors / researchers**, **Partnerships**. Honest scenario copy, no fake named customers.
- **CTA** + Footer.

### 7.5 About `/about`
- **Hero:** "We think prospecting should show its work." Mission statement.
- **Story** (prose, 65ch): why a multi-agent, evidence-first, free approach.
- **Principles** (3–5 cards): *Show the evidence · Quality over volume · Plain English in, real leads out · Free and honest · Your data is yours.*
- **(Optional) team placeholder** — honest "small team / building in the open" note; leave a slot. **CTA** + Footer.

### 7.6 Blog index `/blog`
- **Header:** "Resources" — "Field notes on prospecting, AI agents, and building a pipeline that shows its work." Category chips.
- **Featured post** (large) + **grid of post cards** (thumbnail block, category, title, excerpt, reading time, date). 3–6 seed articles (researched, real-topic copy). Cards link to `/blog/[slug]`.
- **Newsletter capture** (single email field, honest, optional) + Footer.

### 7.7 Blog article `/blog/[slug]`
- Manuscript grid: **article header** (category, h1 display, author + avatar, date, reading time) → **body** (65ch, 18px, headings every ~250 words, pull-quote, code/mono callouts where relevant) → **author bio** → **related posts (3)** → CTA → Footer. Provide one fully-written seed article as the template.

### 7.8 FAQ `/faq`
- **Hero:** "Questions, answered." Grouped accordions: **Getting started · How it works · Data & privacy · Pricing & limits · Accuracy & trust.** 12–18 Q&As (see §12). **CTA** ("Still curious? Contact us") + Footer.

### 7.9 Contact `/contact`
- Two-column: left = "Talk to us" copy + direct email (`Abhay@getleadsmith.ai`) + response-time honesty + social; right = **form** (Name, Work email, Company [optional], "How can we help?" select [Question · Demo · Feedback · Partnership], Message). Top-aligned labels, validate on blur, preserve on error, success toast + inline success state, humane errors. Single primary "Send message". No paste-blocking. **Footer.**

### 7.10 Privacy `/privacy` & Terms `/terms`
- Legal template: title + "Last updated" + intro + numbered sections + TOC sidebar on desktop. 65ch prose, calm. Real, reasonable boilerplate adapted to a free AI lead-discovery tool (data handling, Gemini processing, no resale of data, user responsibilities, acceptable use). Footer.

### 7.11 404 (`not-found`)
- Centered, max-width 480px, brand moment: forge-spark mark, "This page got away." friendly copy, primary "Back to home" + secondary "Open the app", and 3 popular links (Product, How it works, Blog). Matches site personality.

---

## 8. Component Specs (marketing) — all variants × all states
Focus everywhere: `2px ring(--ring) + 2px offset`. Clickable → `cursor:pointer`. Disabled → `opacity .5 + pointer-events:none + aria-disabled`. Touch targets ≥ 44px. Every interactive element has hover + focus-visible + active.

- **Button** — `primary` (signal cyan; on dark, glow on hover), `secondary` (surface + border), `ghost` (text, hover bg tint), `link`. Sizes sm/md/lg. Loading = spinner replaces label, **width preserved**. Labels: verb-first, first-person where it fits ("Open the app", "Send message"). asChild for `<Link>`.
- **Site nav** — sticky; transparent over hero, gains `backdrop-blur` + hairline border + `--surface/80` on scroll. Mega-menu (Radix-less, accessible popover/hover-intent), keyboard nav, ESC closes, focus trap-free. Mobile sheet.
- **Theme toggle** — light/dark/system; icon+label; persists (next-themes); no flash (suppressHydrationWarning + inline). 44px target.
- **Eyebrow / overline chip** — `--primary-soft` bg, primary text, uppercase +0.08em, small icon (Lucide).
- **Bento card / feature card** — surface bg, hairline border, 24–32px padding, hover = subtle lift (translateY -2px) + border brighten; varied sizes (no identical grid). Icon in a soft tile.
- **Stat / spec item** — mono tabular numeral (large) + label; count-up on view (reduced-motion → instant).
- **Pipeline strip** — the 6 agents as connected nodes/pills that light up sequentially (`whileInView`, stagger); states pending/running/done; static under reduced-motion.
- **Trace graph (React Flow)** — reused as a marketing visual; animated edges; static fallback; pan/zoom optional on its page; minimap hidden < 768.
- **App mockup frame** — a "browser/app chrome" wrapper around static screenshots/recreations of the app (search panel, leads table, score ring, outreach card). `aspect-ratio` set; lazy; subtle shadow/glow + border. These sell the product.
- **Accordion (FAQ)** — single-open or multi; chevron rotates; content height animated via grid-rows or measured; keyboard accessible; `<details>`-semantics or Radix.
- **Testimonial slot** — designed but **honest**: ship as product-truth quotes/illustrative persona scenarios clearly framed; structurally ready to drop real named testimonials (photo/name/role/company) later. Never fabricate named people/companies/metrics.
- **Form controls** — Input/Textarea/Select with persistent top labels, helper + error text (icon+text), blur validation, success state. Email format hint via placeholder (format only).
- **Blog post card** — image block (aspect 16:9, `--muted` placeholder), category chip, title (h3), excerpt (2 lines clamp), meta row (date · reading time). Hover lift.
- **Pull-quote / callout (blog)** — accent left-border + larger text.
- **Toast** — copy/send/error feedback (sonner).
- **Skeleton** — for any async/lazy media. Nothing < 300ms.

### State coverage (explicit)
- **Contact form:** empty → filling → invalid (blur) → submitting (button spinner) → success (inline + toast) → error (humane, retry, input preserved).
- **Newsletter:** idle → invalid → success ("You're on the list.") → error.
- **Blog index empty/category-empty:** headline + copy + "Clear filter" CTA.
- **Mega-menu / mobile sheet:** open/close, keyboard, focus return.
- **404:** the page itself is the empty/error state.

---

## 9. Motion (rich but information-bearing)
- **Durations:** micro/hover `120ms` · default `180ms` · panel/menu `240ms` · scroll-reveal `360ms` · hero/pipeline orchestration `≤ 500ms`. **Exit 40–80ms faster than enter.**
- **Easing:** ease-out (enter), ease-in (exit), ease-in-out (reposition). Premium snap `cubic-bezier(0.32,0.72,0,1)`. Spring only for subtle settle (menu, node).
- **GPU-only:** animate `transform` + `opacity` exclusively. Never width/height/top/left.
- **Budget:** ≤ 2 animated focal elements per viewport.
- **Signature moments (all reduced-motion-gated):** hero signal-grid/aurora (opacity+transform, paused off-screen) + headline word-stagger; section scroll-reveals (`whileInView`, stagger 40ms, translateY 16px + opacity); **Lenis smooth scroll (marketing only)**; pipeline lighting up sequentially; React Flow animated edges; stat count-up; nav glass-blur transition on scroll; mega-menu fade/scale.
- **`prefers-reduced-motion: reduce`** (in `@layer base`, `!important`): disable transforms/parallax/animated-bg/edge-animation/Lenis/count-up; keep instant opacity; graphs static.

---

## 10. Elevation & z-index
- **Light:** 3-step neutral-cool-tinted soft shadow scale (premium, low-spread) + hairline borders.
- **Dark:** elevation by surface lightness (`--background`→`--surface`→`--surface-2`); accent glow only on focal/active.
- **z-index scale:** dropdown `1000` · sticky-nav `1020` · sheet/drawer `1030` · modal `1050` · mega-menu/popover `1060` · tooltip `1070` · toast `1080`. No `9999`.

---

## 11. Responsive (375 / 768 / 1024 / 1280 / 1440)
- **Global:** mobile-first; `min-h-dvh` not `vh`; no horizontal scroll; images carry `aspect-ratio`; sticky-header offset on anchors; 16px min body on mobile (no iOS zoom).
- **Nav:** full visible links ≥ 1024; sheet menu < 1024; sticky bottom CTA bar on mobile after hero.
- **Hero:** single column < 768; display type scales via clamp; search-field full-width; CTAs stack.
- **Bento/features:** multi-size ≥ 1024 → 2-col 768 → 1-col mobile (maintain hierarchy, large tile first).
- **Product alternating blocks:** image-below-text stack on mobile.
- **Use-cases / blog grid:** 3-col → 2-col → 1-col.
- **Blog article & legal:** 65ch column; TOC sidebar hidden < 1024 (becomes top "On this page" collapsible).
- **Footer:** 4–5 columns → 2 → 1.

---

## 12. Copy & Messaging Library  *(NEW — canonical; build agents must use/extend, not invent off-voice)*
**Hero headline:** "Find your next customers in plain English."
**Hero sub:** "Describe the companies you want in one sentence. A team of AI agents discovers, qualifies, and ranks real leads — with the evidence behind every score."
**Primary CTA:** "Open the app" ? `/app`. **Secondary:** "See how it works" ? `/how-it-works`. **Trust line:** "Evidence-backed leads with inspectable reasoning."
**Example queries (mono, cycle in hero & throughout):**
- "e-commerce brands in the EU with weak SEO"
- "Series A fintechs hiring their first sales rep"
- "agencies in Texas using HubSpot"
- "B2B SaaS companies without a careers page"

**The 6 agents (canonical names + one-liners):**
1. **Intent** — "Turns your sentence into a precise ideal-customer profile."
2. **Discovery** — "Finds real candidate companies across the open web — no paid data brokers."
3. **Qualify** — "Scores every lead 0–100 across six confidence-weighted dimensions."
4. **Critic** — "Adversarially reviews the evidence and rejects weak matches."
5. **Enrich** — "Adds the right contact, role, and email — with a confidence rating."
6. **Outreach** — "Drafts a personalized first message you can actually send."

**Differentiator lines:** "A team of agents, not one prompt." · "Evidence behind every score." · "It shows its work." · "Quality over volume." · "Free, and honest about it."

**Problem trio:** "Hours lost to manual research." · "Generic lists that don't fit your ICP." · "Black-box tools you can't trust." 

**Transparency block:** "Free, powered by Google Gemini." · "No paid data APIs." · "Every lead comes with its evidence." · "Your data stays yours." · "We're honest about what it can't do."

**FAQ seed (use across home top-5 + /faq):**
- *Is Leadsmith AI really free?* Yes — it runs on Google Gemini's free tier and uses no paid data APIs, so there's nothing to pay and no credit card.
- *Where do the leads come from?* The discovery agent searches and reads the open web — not a resold data broker list — so results are current and explainable.
- *How accurate are the scores?* Every lead is scored across six dimensions, then an adversarial critic challenges weak evidence. You see the evidence and confidence behind each score, so you can judge it yourself.
- *Do you guarantee verified emails?* No tool can. We label each email as verified, guessed, or unknown with a confidence rating — we never pretend a guess is a fact.
- *What does "it shows its work" mean?* You get a live agent trace, per-dimension scores, the critic's verdict, and run metrics — not just a list.
- *Is my data safe?* Your queries and results are yours; we don't sell data. (Details in Privacy.)
- *Can I export leads?* Yes — results export from the app.
- *Do I need to know boolean search or filters?* No — describe your buyer in plain English; the intent agent handles the structure.
- *What can't it do (yet)?* It won't fabricate contacts or guarantee deliverability; it's a discovery and qualification engine, not a sending platform.

**404:** "This page got away." / "The link may be broken, or the page may have moved."
**Honesty guardrail:** no invented customer names, logos, headcounts, revenue, or testimonial quotes attributed to real-sounding people/companies. Social proof = product truth + transparency until real proof exists.

---

## 13. Do's & Don'ts (traced to evidence)
**Do**
1. One signal-cyan accent; everything else neutral. *(Von Restorff; premium-precision; SaaS "max 2 accents")*
2. Mono tabular numerals, right-aligned, for every score/metric/email. *(analytics rules; Tufte)*
3. Section order Hero→Proof→Problem→Features→How→Use-cases→Transparency→FAQ→CTA→Footer. *(Unbounce 41K)*
4. Single primary CTA ("Open the app") repeated after each major section; trust line beside it. *(CTA +266%/+34%)*
5. First-person, verb-first, sentence-case copy at grade 5–7. *(ContentVerve +90%; conversion-copy)*
6. Honest social proof: product-truth + transparency; real-testimonial slot left open. *(95% spot fakes; Rams honesty)*
7. Both light & dark fully designed and contrast-tested. *(P1; color-dark-mode-test)*
8. Visible desktop nav (no hamburger ≥1024); mobile sheet + sticky CTA bar. *(nav 39% slower; thumb-zone)*
9. Bleed 64px of next section below the hero. *(false-floor; +102% below-fold views)*
10. Top-aligned form labels; validate on blur; preserve input on error. *(form-design)*

**Don't**
1. No AI-purple `#6366F1`/`#8B5CF6`; no purple gradients. *(AI-slop #1)*
2. No grid of identical cards — use varied bento. *(AI-slop #2)*
3. No `font-weight:500` flatland — 600 headings vs 400 body. *(typography anti-pattern)*
4. No `1.75` line-height on UI (prose/blog only). *(typography anti-pattern)*
5. No decorative `animate-bounce`/`pulse`; motion serves info. *(motion anti-pattern)*
6. No width/height/top/left animation. *(jank)*
7. No same token for charts and UI. *(→ `--chart-*`)*
8. No dark-mode-by-inversion; no pure `#000`/`#FFF`. *(color anti-patterns)*
9. No color-only state. *(P1 color-not-only)*
10. No fabricated customers/logos/metrics/testimonials. *(honesty)*

---

## 14. Anti-Pattern checklist (this design passes)
- [x] Custom brand hue in OKLCH (signal cyan ~210), not AI-purple; no purple gradients
- [x] OKLCH 3-layer tokens (ramp → semantic → Tailwind bridge); `--chart-*` separate, Okabe-Ito
- [x] Committed cool neutrals w/ intentional chroma (not dead cold grey)
- [x] Dark = redesign (opacity borders + surface elevation, no pure black); **light fully designed**, near-black on tinted near-white
- [x] Ratio type scale; 600/400 weight contrast; negative heading tracking; ≤2 families; 65ch prose
- [x] 4px-grid spacing; semantic/contextual spacing; max-width 1280 / 65ch
- [x] Varied bento (not identical-card grid); borders only with purpose; row-hover on any table
- [x] All states designed; focus rings; 44px targets; loading + empty + error; hover + cursor-pointer
- [x] SVG/Lucide icons, no emojis; named z-index scale; image aspect-ratio; sticky-nav body offset
- [x] Motion GPU-only, ≤500ms, non-linear easing, exits faster, `prefers-reduced-motion`
- [x] Honest social proof (no fabricated proof); single repeated CTA; trust line near CTAs

---

## 15. Accessibility & performance budget
- **A11y floor:** WCAG **AA** (AAA-leaning body) in **both modes**; visible 2px focus rings; 44px targets; semantic HTML (`nav/main/section/article/button/a`); sequential headings; skip-link; `aria-label` on icon buttons; color never the only signal; reduced-motion honored globally; nav/menu keyboard + ESC; alt text (decorative `alt=""`).
- **Perf:** LCP < 2.0s; CLS < 0.05 (image `aspect-ratio`, button width preserved on load); INP < 200ms; prerender static routes; lazy-load below-fold media + React Flow; fonts `display:swap` (Geist self-hosted via next/font); animated bg paused off-screen.
- **SEO/meta:** per-page `metadata` (title/description/OG), `metadataBase` `https://getleadsmith.ai`, `opengraph-image` (stacked lockup), sitemap + robots, JSON-LD `Organization` + `SoftwareApplication` on home.
```
