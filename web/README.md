# Leadsmith — web

The Next.js frontend for **Leadsmith**: a marketing landing page plus an interactive
app dashboard for the multi-agent lead-discovery engine. Built to the contract in
[`DESIGN.md`](./DESIGN.md) — refined-minimal (Linear/Vercel), dark-first, with a
light theme, strong contrast, and GPU-only motion that respects
`prefers-reduced-motion`.

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** with an OKLCH design-token system (`app/globals.css`)
- **shadcn-style** primitives on **Radix** (`components/ui/*`)
- **Motion** (`motion/react`) for animation · **Lenis** smooth scroll (landing only)
- **React Flow** (`@xyflow/react`) for the agent trace graph
- **next-themes** (dark default) · **lucide-react** icons · **sonner** toasts

## Prerequisites

[Bun](https://bun.com) (this project is managed with bun). Node 18+ also works if
you swap the commands for `npm`/`pnpm`.

## Quickstart

```bash
bun install
bun run dev          # http://localhost:3000
```

Then open `/` for the landing page and `/app` for the workspace.

### Scripts

| Script | What it does |
|---|---|
| `bun run dev` | Dev server |
| `bun run build` | Production build |
| `bun run start` | Serve the production build (`PORT=3210 bun run start` to change port) |
| `bun run typecheck` | `tsc --noEmit` |

## How it connects to the backend

The UI runs on **mock fixtures** with **simulated live agent streaming**, so it is
fully demonstrable with no API key. Everything goes through one typed seam:

```
lib/leadsmith-client.ts   →  ILeadsmithClient.run(request, flags, { onEvent, signal })
```

`MockLeadsmithClient` emits the same `RunEvent` stream a real backend would. To wire
the real Python engine (`leadsmith/pipeline.py`), implement `ILeadsmithClient` against
an SSE/WebSocket endpoint and export it as `leadsmith` — **no UI changes required**.
The domain types in `lib/types.ts` mirror the pydantic models in `leadsmith/models.py`
exactly (including `candidates_found` / `candidates_skipped` and the three distinct
empty-result reasons).

## Project structure

```
app/
  globals.css            # OKLCH tokens (light + dark), reduced-motion, keyframes
  layout.tsx             # fonts, ThemeProvider, skip-link, Toaster
  page.tsx               # landing (Lenis-wrapped)
  app/layout.tsx         # app shell: sidebar + header
  app/page.tsx           # workspace: search → live agents → leads → trace → metrics
components/
  ui/                    # primitives (button, card, dialog, sheet, slider, …)
  motion/                # Reveal / Stagger / CountUp (reduced-motion aware)
  landing/               # hero, signal-grid, features bento, how-it-works, faq, …
  app/                   # search panel, agent pipeline, leads table, lead drawer,
                         # trace graph (React Flow), metrics bar, command menu, …
hooks/use-leadsmith-run.ts # run state machine over the streamed events
lib/                     # types, mock-data, leadsmith-client (the swappable seam), utils
```

## Notes

- **Accessibility:** WCAG-AA floor (AAA-leaning body text), visible focus rings,
  44px targets, semantic HTML, `prefers-reduced-motion` honored globally, color is
  never the only signal (scores always show the number).
- **Theme:** dark by default; toggle in the nav/header. Both themes are
  token-driven (no inversion hacks).
- **Performance:** animations are limited to `transform`/`opacity`; the production
  build prerenders both routes as static.
