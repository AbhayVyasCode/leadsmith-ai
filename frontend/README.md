# Leadsmith — web

The Next.js frontend for **Leadsmith**. It has a marketing site and the `/app`
workspace, where you describe a buyer, watch the agents research, and review
leads with the evidence behind every score.

The UI uses the **Ember** design system. Tokens, type, motion and accessibility
rules are in [`DESIGN.md`](./DESIGN.md).

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4**: tokens in `app/globals.css`, plus CSS Modules for complex components
- **next-themes** for light/dark/system · **Radix** (dialog and popover only) · **sonner** toasts · **lucide-react** icons
- **convex** (optional): reads runs and memory from Convex when the backend writes there
- Fonts: Instrument Serif, Instrument Sans and JetBrains Mono, all through `next/font`

There is no animation library. All motion is CSS (see `DESIGN.md` §4).

## Quickstart

Requires [Bun](https://bun.com).

```bash
bun install
bun run dev          # http://localhost:3000
```

Open `/` for the site and `/app` for the workspace.

| Script | What it does |
|---|---|
| `bun run dev` | Dev server |
| `bun run build` | Production build (every route prerenders as static) |
| `bun run start` | Serve the production build |
| `bun run typecheck` | `tsc --noEmit` |

## Environment (`.env.local`)

| Variable | Effect |
|---|---|
| `NEXT_PUBLIC_LEADSMITH_API` | URL of the Python backend (`server.py`), e.g. `http://localhost:8000`. **Unset → demo mode:** runs use built-in sample data, and the workspace says so. |
| `NEXT_PUBLIC_CONVEX_URL` | Optional. Set it only when the backend also writes to Convex. If set, runs and memory are read from Convex; otherwise they come from the backend API. |

## How it talks to the engine

Everything goes through one typed interface in `lib/leadsmith-client.ts`:

- `HttpLeadsmithClient` streams runs over server-sent events from
  `POST /api/discover` and `POST /api/discover/continue` ("Find more").
  It reads history and memory from `/api/runs` and `/api/memory` (or Convex) and
  checks `/api/health` for the engine status card.
- `MockLeadsmithClient` emits the same event stream from sample data. It powers demo mode.

`hooks/use-leadsmith-run.ts` turns the event stream into UI state: status, pipeline
steps, leads, warnings and the final report. Engine errors are shown with their real
message.

## Structure

```
app/
  (site)/            # marketing: landing page (/) and /legal
  app/               # workspace: Discover (/app), Runs, Memory
  globals.css        # Ember tokens, base styles, CSS-first motion
  layout.tsx         # fonts, theme provider, skip link, metadata
  opengraph-image.tsx, icon.svg, robots.ts, sitemap.ts, not-found.tsx
components/
  ui/                # primitives: button, badge, score ring, meter, sheet, dialog, …
  site/              # marketing sections
  app/               # workspace: shell, composer, pipeline, lead list/sheet, trace, …
  brand/ theme/      # logo; theme provider and toggles
hooks/               # run state machine
lib/                 # engine client, types, CSV export, sample data, site config,
                     # helpers (utils), class merging (cn), keyboard a11y (a11y)
assets/fonts/        # Instrument Serif TTFs for the generated OG image (OFL)
```
