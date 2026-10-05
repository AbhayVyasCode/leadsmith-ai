# Ember — the Leadsmith design system

Leadsmith turns a one-line brief into qualified leads with the evidence behind
every score. The visual idea is a **forge**: warm paper and ink, one ember
accent, editorial serif headlines, and monospace wherever the product shows
data or evidence.

Everything below is implemented in `app/globals.css` and `components/ui/*`.
When you change a token or a rule, change it here too.

---

## 1. Colour

Two first-class themes. Light is designed in its own right, not inverted from dark.
Tokens live on `:root` (light) and `.dark`. Tailwind exposes them through
`@theme inline` as `bg-canvas`, `text-ink-2`, `border-line` and so on.

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#f6f4ef` | `#0f0e0d` | Page background |
| `panel` | `#ffffff` | `#181614` | Cards, sheets, menus |
| `panel-2` | `#efece5` | `#221f1c` | Wells, selected rows, chips |
| `ink` | `#161412` | `#f4f0e8` | Primary text |
| `ink-2` | `#56504a` | `#bcb4a7` | Secondary text |
| `ink-3` | `#6e675e` | `#958d81` | Tertiary text, labels, placeholders |
| `line` / `line-2` | `#e3ded5` / `#cbc3b6` | `#2a2724` / `#4a443e` | Hairlines / stronger borders |
| `ember` | `#ff5a1f` | `#ff6a33` | Accent **fills** only (buttons, rings, live dots) |
| `ember-ink` | `#be3d0a` | `#ff8a5b` | Accent **text and icons** on surfaces |
| `on-ember` | `#161412` | `#0f0e0d` | Text on an ember fill |
| `ok` / `warn` / `bad` | `#12764f` / `#94570a` / `#be2430` | `#4bd69a` / `#f0b54a` / `#ff7b78` | Score bands and status |
| `steel` | `#5b6f82` | `#9db2c6` | Confidence and timing bars (graphics only) |

**Contrast rules (all measured):**

- Every text token is at least **4.5:1** on `canvas`, `panel` and `panel-2` in both themes.
  The tightest pair is `ember-ink` on `panel-2` in light, at 4.61:1.
- Ember is never used as text. Ember fills carry **ink text**: 5.89:1 in light, 6.76:1 in dark.
  Use `ember-ink` for accent-coloured words such as the italic `<em>` in headings.
- `steel` is for bars only. It passes the 3:1 rule for graphics (4.4:1 at minimum) but is not a text colour.
- Colour is never the only signal. Scores always show the number, email confidence
  always shows a word ("Found", "Verified", "Guessed", "Unknown"), and pipeline
  steps always have an icon.

## 2. Type

| Role | Family | Where |
|---|---|---|
| Display | **Instrument Serif** (`font-display`) | Headlines, lead names, quotes, big numbers |
| Interface | **Instrument Sans** (`font-sans`) | Body copy, buttons, forms |
| Data | **JetBrains Mono** (`font-mono`) | Eyebrows, domains, emails, metrics, timers, state labels |

- All three load through `next/font` (self-hosted, no layout shift).
- Display sizes use `clamp()`, for example `clamp(2.6rem, 6.4vw, 4.6rem)` for page titles. Tracking is slightly negative (`-0.015em` to `-0.022em`).
- `.eyebrow` is mono at 0.72rem, uppercase, tracked `0.14em`.
- Use `tnum` (tabular numerals) for anything that counts or ticks.
- Headings use `text-wrap: balance` and paragraphs use `pretty`. Both are set globally.

## 3. Shape and depth

- **Cards** use the `card` utility: `panel` fill, 1px `line` border, `1.25rem` radius, `--sh-card` shadow.
- **Pills everywhere else:** buttons, badges, segmented controls and inputs are fully rounded.
- **Shadows:** `shadow-card` for resting surfaces and `shadow-float` for sheets and popovers. In dark mode, shadows add a 1px ring so edges still read.
- **Texture:** `ledger` draws a 56px grid in `--grid-line`, used behind heroes. `--glow` is the ember haze.

## 4. Motion

The goal is a highly animated feel at near-zero JavaScript cost.

- **CSS first.** No motion library ships. Animations use `transform` and `opacity` only.
- **Scroll-driven reveals** (`.reveal`, `.reveal-fade`, `.reveal-count`) use
  `animation-timeline: view()` inside `@supports` and `prefers-reduced-motion: no-preference`.
  Where either is unsupported, content is simply visible.
- **Numbers and rings animate without JavaScript.** `@property --num` (integer) and `--p` (number) are registered in
  `globals.css`. Counters use `counter-reset` with `--num`, and score rings sweep a conic gradient with `--p`.
- **Easing:** `--ease-ember` `cubic-bezier(.2,.8,.2,1)` for entrances, `--ease-spring`
  `cubic-bezier(.34,1.4,.64,1)` for small pops. These are defined on `:root`, not in `@theme`, so CSS modules can read them.
- **Reduced motion:** a global rule cuts all animations and transitions to 0.01ms. The
  forge console and the ember particles also switch themselves off.
- **Off-screen loops pause.** Mark a decorative infinite animation's container with `data-loop`.
  `LoopGate` (`components/site/loop-gate.tsx`) sets `data-offscreen` when it leaves the viewport,
  and a rule in `globals.css` pauses everything inside, so the page can go idle. Without JS, loops
  simply keep running. A `data-loop` element needs a real box (not zero-height) to be observed.
- **CSS Modules gotcha:** `@keyframes` inside a module are scoped to that module. Define them in the module that uses them, or use the global ones in `globals.css`.

## 5. Components

| Layer | Path | Contents |
|---|---|---|
| Primitives | `components/ui/` | `Button` (primary · secondary · ink · ghost), `Badge`, `ScoreRing`, `ConfidenceMeter`, `EmailLabel`, `Switch` and `Range` (native inputs), `Skeleton`, `Sheet`, `ConfirmDialog`, `Popover`, `Toaster` |
| Brand | `components/brand/` | `LogoMark` (lead ingot and spark), `Logo` |
| Theme | `components/theme/` | `ThemeProvider`, `ThemeToggle` (icon swap via `dark:`, no mount flash), `ThemeSwitch` (3-way) |
| Marketing | `components/site/` | Header (glass on scroll), mobile menu (native Popover API), hero and forge console, briefs marquee, comparison, how-it-works, features bento, showcase, use cases, principles, FAQ (native `<details>`), final CTA, footer |
| Workspace | `components/app/` | App shell, engine status, composer, run settings, run header, pipeline, lead list, lead sheet, run aside, trace view, empty and error states |

Radix is used only for dialog and popover, where focus management is hard to do well by hand.
Everything else is native HTML: `<details>`, `popover`, `input[type=range]`, and a checkbox with `role="switch"`.

## 6. Pages

| Route | Purpose |
|---|---|
| `/` | Landing page: hero → marquee → comparison → how it works → features → showcase → use cases → principles → FAQ → CTA |
| `/legal` | Privacy and terms, stating which providers see what data |
| `/app` | Discover: compose a brief, watch the run, review and export leads |
| `/app/runs` | Saved runs: open, filter, delete |
| `/app/memory` | Remembered companies: what future runs skip, with a "forget" action |
| 404 | "Nothing forged here." |

## 7. Performance rules

- Server components by default. On the marketing site, only small islands run on the client: the theme toggle, mobile menu, forge console, step index, use-case tabs and the cursor spotlight. The `/app` workspace is client-rendered because it streams live runs.
- **Layout safety:** every grid gets a mobile column template (`grid-cols-1`, which is `minmax(0,1fr)`), so
  long or `nowrap` content can't widen the page. Every route is checked for horizontal overflow at 320px and 390px.
- **No layout shift on load:** data-driven pages reserve their stats and toolbar slots while loading.
- No motion, smooth-scroll or graph libraries. Animation is CSS, so the landing page ships almost no JavaScript beyond Next's runtime.
- The site uses no photographs. Visuals are CSS, SVG and type, so there's nothing to lazy-load or decode. The Open Graph image is generated at build time (`app/opengraph-image.tsx`).
- Fonts go through `next/font` with `display: swap` and are subset to Latin.
- **`cn` vs `clsx`:** `cn` (`lib/cn.ts`) runs tailwind-merge. Use it only in components that
  take a `className` override. Marketing client islands, and anything they import, use plain
  `clsx`, and links styled as buttons import `components/ui/button-variants`. This keeps
  tailwind-merge out of the landing-page bundle.
- The Convex client is imported on demand (`lib/leadsmith-client.ts`), only when
  `NEXT_PUBLIC_CONVEX_URL` is set.

## 8. Accessibility floor

- WCAG 2.2 AA contrast in both themes (section 1).
- Visible focus: a 2px ember outline with a 3px offset on every focusable element.
- A skip link to `#main`. Landmarks on every page.
- Live regions for run status and activity. `role="meter"` on confidence bars.
- Targets meet WCAG 2.2's 24px minimum. On touch screens (`pointer-coarse`), compact
  buttons grow to 40px. On phones the lead sheet becomes a bottom sheet.
- Keyboard: Ctrl/⌘ + Enter submits a brief. Radiogroups (`radioGroupKeys` in `lib/a11y.ts`)
  and the use-case tabs move with arrow keys. Radix handles focus inside dialogs.

## 9. Voice

Plain, specific, honest. Say what the engine does and where it stops. For example:
the critic **flags** weak leads and never deletes them, an email is **Guessed** when it was
inferred, and runs fail with the **real error** plus a hint. Avoid invented numbers and logos.
