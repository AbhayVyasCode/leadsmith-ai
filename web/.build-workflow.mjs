export const meta = {
  name: "leadsmith-frontend-build",
  description: "Build Leadsmith landing + app feature components to the DESIGN.md contract",
  phases: [
    { title: "Build landing", detail: "hero, proof, problem, features, how-it-works, testimonials, faq, cta" },
    { title: "Build app", detail: "search, pipeline, icp, leads table, drawer, metrics, trace graph, command menu, empty states" },
    { title: "Review", detail: "design-compliance + a11y audit of generated components" },
  ],
};

const FOUNDATION = [
  'You are building React component file(s) for the "Leadsmith" frontend: Next.js 15 App Router + Tailwind v4 + Motion + Radix, in the directory D:/Personal/sales agent/web .',
  "The shared foundation ALREADY EXISTS — import from it; never recreate it. Do NOT edit any file other than the one(s) assigned to you. Do NOT run npm/bun or install anything. Do NOT modify globals.css, package.json, tsconfig, layout, or any existing lib/ or components/ui/ file.",
  "",
  "FIRST: read D:/Personal/sales agent/web/DESIGN.md and obey it. Aesthetic = refined-minimal, Linear/Vercel, dark-first, premium-precision. Advanced but information-bearing motion, zero jank.",
  "",
  "DESIGN TOKENS — these Tailwind utilities are already wired. USE THESE; NEVER hardcode hex/rgb, never use bg-white/bg-black/text-black/text-gray-*/bg-gray-*/bg-slate-* or any AI-purple:",
  "- Surfaces: bg-background, bg-surface, bg-surface-2, bg-muted",
  "- Text: text-foreground, text-muted-foreground",
  "- Borders: border-border, border-input (prefer border-border)",
  "- Accent: bg-primary, text-primary, text-primary-foreground, bg-primary-soft; focus uses outline-ring (already global)",
  "- Status (always pair color WITH the number/label, never color-only): text-success/bg-success-soft, text-warning/bg-warning-soft, text-danger/bg-danger-soft and their -foreground variants",
  "- Charts: bg-chart-1..bg-chart-8 / text-chart-1..8 (use for data viz only, not UI)",
  "- Radius: rounded-md (=8px), rounded-lg, rounded-xl, rounded-full",
  "- Numerals (scores/metrics/emails): add classes 'tnum font-mono'. Right-align numbers in tables.",
  "",
  "FOUNDATION IMPORTS available (import exactly these):",
  '- import { cn, scoreBand, bandToken, formatCost, formatCompact } from "@/lib/utils"  (scoreBand(n)=>"low"|"mid"|"high"; bandToken[band]={fg,bg,label})',
  '- import type { Lead, ICP, Company, Contact, OutreachDraft, Critique, DimensionScore, Qualification, RunMetrics, TraceNode, AgentState, AgentKey, AgentStatus, RunFlags } from "@/lib/types"',
  '- import { DIMENSION_LABELS, AGENT_LABELS, DEFAULT_FLAGS } from "@/lib/types"',
  '- import { EXAMPLE_QUERIES } from "@/lib/mock-data"',
  '- UI: "@/components/ui/button" Button(variant: default|secondary|outline|ghost|destructive|link; size: sm|default|lg|icon; asChild) ; "@/components/ui/badge" Badge(variant: default|primary|success|warning|danger|outline) ; "@/components/ui/card" {Card,CardHeader,CardTitle,CardDescription,CardContent,CardFooter} ; "@/components/ui/input" Input ; "@/components/ui/textarea" Textarea ; "@/components/ui/label" Label ; "@/components/ui/switch" Switch(checked,onCheckedChange) ; "@/components/ui/slider" Slider(value:number[],onValueChange,min,max,step) ; "@/components/ui/tabs" {Tabs,TabsList,TabsTrigger,TabsContent} ; "@/components/ui/tooltip" {Tooltip,TooltipTrigger,TooltipContent} (provider already mounted) ; "@/components/ui/popover" {Popover,PopoverTrigger,PopoverContent} ; "@/components/ui/dialog" {Dialog,DialogTrigger,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter,DialogClose} ; "@/components/ui/sheet" {Sheet,SheetTrigger,SheetContent,SheetHeader,SheetTitle,SheetDescription,SheetClose} ; "@/components/ui/scroll-area" ScrollArea ; "@/components/ui/skeleton" Skeleton ; "@/components/ui/separator" Separator',
  '- Motion helpers (already reduced-motion aware): import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal" ; import { CountUp } from "@/components/motion/count-up"',
  '- Low-level motion: import { motion, useReducedMotion, AnimatePresence } from "motion/react"  (this project uses the "motion" package; NEVER import from "framer-motion")',
  '- Icons: import { Search, Loader2, ... } from "lucide-react"  (NEVER use emojis as icons)',
  '- Brand: import { Brand, BrandMark } from "@/components/brand"',
  '- Toasts: import { toast } from "sonner"',
  "",
  "HARD RULES (from DESIGN.md, non-negotiable):",
  "- Add 'use client' as the very first line IF the file uses state/effects/motion/Radix/browser APIs/event handlers.",
  "- Motion: animate ONLY transform & opacity (never width/height/top/left/margin). Durations <= 500ms; exits faster; ease-out on enter. Prefer the Reveal/Stagger helpers for scroll reveals. For any hand-written motion, call useReducedMotion() and render a static fallback. Max ~2 animated focal elements per viewport. No decorative bounce/pulse (skeleton pulse is fine).",
  "- a11y: icon-only buttons MUST have aria-label; decorative svg/icons get aria-hidden. Use semantic html (section/nav/button/a/table). Primary action targets >= 44px (Button default size already 44px). Score/status colors must always appear alongside the numeric value or a text label (never color-only).",
  "- Type: headings use font-semibold + tracking-tight; body is normal weight; numerals use 'tnum font-mono'. Keep copy sentence-case, grade 5-7, specific.",
  "- Must compile under TypeScript strict + React 19. Fully typed props (no any unless unavoidable). Export EXACTLY the requested named export(s).",
  "- Produce the file by WRITING it with the Write tool to the exact path given. Keep it production-quality, cohesive, and genuinely premium — not generic.",
].join("\n");

const SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    files: { type: "array", items: { type: "string" }, description: "Absolute paths written" },
    exportNames: { type: "array", items: { type: "string" } },
    deviations: { type: "string", description: "Any deviation from the contract, or 'none'" },
  },
  required: ["files", "exportNames", "deviations"],
};

const REVIEW_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    violations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          file: { type: "string" },
          issue: { type: "string" },
          severity: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["file", "issue", "severity"],
      },
    },
    summary: { type: "string" },
  },
  required: ["violations", "summary"],
};

const W = "D:/Personal/sales agent/web";

const LANDING = [
  {
    label: "hero+signal-grid",
    spec: [
      `Create TWO files.`,
      `(1) ${W}/components/landing/signal-grid.tsx — export function SignalGrid({ className }: { className?: string }). A GPU-only animated ambient background evoking radar/signal discovery: a faint dot-grid (radial-gradient) plus slow concentric "signal" rings or a soft drifting glow built from the primary accent at low opacity, masked to fade out at the edges (mask-image radial-gradient). Animate ONLY transform/opacity via motion (e.g. slow scale/opacity pulse, 6-10s, repeat). Call useReducedMotion() and render the static grid (no animation) when reduced. position absolute, inset-0, pointer-events-none, aria-hidden, overflow hidden. Subtle and premium — barely there.`,
      `(2) ${W}/components/landing/hero.tsx — 'use client'. export function Hero(). Full-bleed top section. Do NOT fill the exact viewport (leave ~64px of the next section visible — no false floor). Contains <SignalGrid/> behind content. Eyebrow Badge variant primary ("Free · multi-agent · Gemini"). Display headline (text-5xl/6xl/7xl fluid via clamp-ish responsive classes, font-semibold tracking-tight, <= 8 words, outcome-focused) e.g. "Find your next customers in plain English." Subheadline (text-muted-foreground, max-w prose). Primary CTA Button asChild lg linking (next/link) to /app with text "Open the app" + a Search/ArrowRight icon; secondary Button variant ghost/outline linking to "#how" "See how it works". A faux command/search field card showing an example query (mono) with a blinking caret (animate opacity; static under reduced motion). Trust line muted: "No paid data APIs · no credit card". Animate the headline words with a stagger on mount (opacity+translateY via motion variants), gated by useReducedMotion. Use a max-w-[1280px] centered container with generous padding.`,
    ].join("\n"),
  },
  {
    label: "logo-proof",
    spec: `Create ${W}/components/landing/logo-proof.tsx — export function LogoProof(). A slim trust band directly under the hero. Left: a named metric line emphasizing the product ("Qualifies every lead with confidence-weighted scoring across 4 dimensions") with the numeral styled tnum font-mono text-foreground. Right (or below on mobile): a row of 5-6 illustrative customer wordmarks as muted text (text-muted-foreground, font-medium, tracking-tight) — NOT images — representing teams (e.g. "Brightleaf", "Northwind", "Harbor&Hide", "CedarLane", "Glasshouse"). Keep static and tasteful; aria-label="Trusted by teams". Use Reveal for entrance. max-w-[1280px] container, border-y border-border optional.`,
  },
  {
    label: "problem-section",
    spec: `Create ${W}/components/landing/problem-section.tsx — export function ProblemSection(). Problem→solution framing in a 2-column layout (stack on mobile). Left: heading "Lead lists are noise." + 3 concise problem bullets (bought lists go stale, generic scrapers can't judge fit, no evidence behind a score) each with a muted X/AlertTriangle lucide icon. Right: Leadsmith's answer — 3 matching points (a supervisor fans out specialized agents, confidence-weighted scoring with evidence, a Reflexion critic drops hallucinated fits) each with a Check icon in text-success. Use Reveal/Stagger. Premium minimal, generous whitespace, max-w-[1280px].`,
  },
  {
    label: "features-bento",
    spec: `Create ${W}/components/landing/features-bento.tsx — export function FeaturesBento(). Section with id="features". An ASYMMETRIC bento grid (NOT identical cards — vary col-span/row-span; e.g. md:grid-cols-3 with one tile spanning 2 cols and one spanning 2 rows). 7 real Leadsmith features: "Multi-agent orchestration" (a supervisor fans work to specialized agents), "Confidence-weighted scoring" (4 dimensions, each scored with evidence + a confidence), "HyDE RAG memory" (recall gets smarter every run), "Reflexion critic" (adversarial re-check drops hallucinated fits), "Zero-cost tech signals" (Shopify/Wix/Vercel headers as buying hints), "Entity dedupe" (never re-research the same company), "Full observability" (LLM calls, tokens, cache hits, cost + an agent trace tree). Each tile: a lucide icon in a bg-primary-soft rounded square, a font-semibold title, a one-line muted benefit. Cards bg-surface border border-border rounded-xl p-6; subtle hover lift via motion (translateY -2px / scale 1.0 -> 1.005, transform only) or hover:bg-muted; gate hand motion with useReducedMotion or just use hover transitions. Use Stagger/StaggerItem for entrance. Section header above grid (eyebrow + title + subtitle). 'use client' (motion). max-w-[1280px].`,
  },
  {
    label: "how-it-works",
    spec: `Create ${W}/components/landing/how-it-works.tsx — 'use client'. export function HowItWorks(). Section id="how". Visualize the pipeline as an ordered flow of 6 steps: 1 Intent (request -> structured ICP), 2 Discovery (find real companies via search grounding), 3 Qualify (score fit with evidence), 4 Critic (refute weak scores), 5 Enrich (find decision-makers + emails), 6 Outreach (draft a first-touch email). Horizontal connected steps on desktop (flex with a connecting line between nodes), vertical on mobile. Each step: a numbered node (rounded-full border, primary when revealed), agent name (font-semibold), one-line description (muted). A progress line that fills as the section scrolls into view (animate scaleX/scaleY via motion whileInView, transform-origin left/top; static under reduced motion). lucide icon per step. Use Reveal for the steps. Premium, max-w-[1280px].`,
  },
  {
    label: "testimonials+faq+cta",
    spec: [
      `Create THREE files.`,
      `(1) ${W}/components/landing/testimonials.tsx — export function Testimonials(). 3 illustrative testimonial Cards in a responsive grid, each: a short quote, a named person (font-medium) with role + company (muted), and an emphasized metric Badge (e.g. "+38% reply rate"). Use Stagger/StaggerItem. Section header. Names clearly plausible-but-illustrative. max-w-[1280px].`,
      `(2) ${W}/components/landing/faq-section.tsx — export function FaqSection(). Section id="faq". An accessible accordion of 6 Q/A using native <details>/<summary> styled with tokens (border-b border-border, summary cursor-pointer py-4 flex justify-between with a ChevronDown lucide that rotates via transform when [open]). Questions: Is it really free? · Where does the data come from (no paid APIs)? · How accurate are guessed emails? · Is this GDPR / CAN-SPAM compliant? · How many leads per run? · Can I plug in my own data later? Answers concise & honest (mirror DESIGN/README: MX-verified domain-level emails flagged 'guessed'; only public pages; free-tier rate-limited ~tens of leads). max-w-3xl centered. Do not animate height (layout) — only rotate the chevron.`,
      `(3) ${W}/components/landing/final-cta.tsx — export function FinalCta(). Closing CTA section: a centered Card or panel (bg-surface or a subtle primary-soft gradient via tokens) with a large heading "Start discovering customers today", a muted subline, a primary lg Button (next/link) to /app "Open the app", and a trust line "Free · no credit card · no paid data APIs". Optionally a faint SignalGrid echo (import { SignalGrid } from "@/components/landing/signal-grid"). Use Reveal. max-w-[1280px].`,
    ].join("\n"),
  },
];

const APP = [
  {
    label: "search-panel",
    spec: `Create ${W}/components/app/search-panel.tsx — 'use client'. export function SearchPanel({ onRun, running, onCancel }: { onRun: (request: string, flags: RunFlags) => void; running: boolean; onCancel: () => void }). The app's primary action surface, in a Card. Top-aligned Label "Describe who you want to find". A Textarea (request) with placeholder example. Below it, EXAMPLE_QUERIES rendered as clickable chips (Button variant outline size sm) that set the textarea value. A controls row: Max companies (Slider min 1 max 12 step 1, show value tnum) ; Min score (Slider min 0 max 100 step 5, show value tnum) ; three Switch+Label pairs: "Draft outreach" (outreach), "Reflexion critic" (critic), "Agent trace" (trace). Manage local state: request string + flags initialized from DEFAULT_FLAGS. Primary Button "Find leads" (Search icon) — disabled when request.trim() is empty OR running; while running, show Loader2 (animate-spin) + text "Searching…" and render a secondary Button "Cancel" calling onCancel (keep button width stable, no layout shift). Submit on click and on Cmd/Ctrl+Enter in the textarea. On submit call onRun(request.trim(), flags). Never clear the textarea on submit. Polished, premium, responsive. Keep all controls keyboard-accessible with visible labels.`,
  },
  {
    label: "agent-pipeline",
    spec: `Create ${W}/components/app/agent-pipeline.tsx — 'use client'. export function AgentPipeline({ agents, activeCompany }: { agents: AgentState[]; activeCompany: string | null }). Render the agents (each {key,label,status,detail,ms}) as a horizontal sequence (wrap on mobile) of status nodes connected by short lines. Per status visuals: pending = dim/muted dotted ring ; running = primary ring with a Loader2 spin or a subtle shimmer (transform/opacity only, gated by useReducedMotion) ; done = CheckCircle2 in text-success ; skipped = MinusCircle muted ; error = AlertCircle in text-danger. Show each agent's label (AGENT_LABELS or state.label) and ms (tnum font-mono) when present. When activeCompany is set, show a small caption "Processing <name>…". The connector line between a node and the next fills (bg-primary) when that node is done — animate scaleX from 0->1 (transform-origin left), static under reduced motion. Wrap in a Card with a header "Agents". Information-bearing only. Accessible: use role/aria-live="polite" on the active caption so screen readers hear progress.`,
  },
  {
    label: "icp-panel",
    spec: `Create ${W}/components/app/icp-panel.tsx — export function IcpPanel({ icp }: { icp: ICP }). A Card titled "Ideal customer profile". A small responsive grid showing Industry / Company size / Geography as labeled fields (overline-style muted label + foreground value). Then groups of Badge chips: pain_points (variant danger or warning soft), buying_signals (variant primary), decision_maker_roles (variant outline), keywords (variant default). Each group has a small muted label. Handle empty arrays gracefully (show nothing or a muted dash). Clean, scannable, premium. Can be a server component (no 'use client' needed unless you add motion — if so add it).`,
  },
  {
    label: "leads-table+score-ring+confidence-meter",
    spec: [
      `Create THREE files (the table imports the other two).`,
      `(1) ${W}/components/app/score-ring.tsx — 'use client'. export function ScoreRing({ score, size = 44 }: { score: number; size?: number }). An SVG circular progress ring filling to score/100, stroke colored by scoreBand(score): high=text-success, mid=text-warning, low=text-danger (use stroke="currentColor" on a group with the band text color class, track stroke = currentColor at low opacity or use text-border). Center label = the score as an integer in tnum font-mono font-semibold. Animate the arc fill on mount via motion (animate strokeDashoffset or pathLength from empty to value, ~0.7s ease-out); static (full) under useReducedMotion. role="img" aria-label={\`Fit score \${score} of 100\`}. Color is paired with the visible number (not color-only).`,
      `(2) ${W}/components/app/confidence-meter.tsx — 'use client'. export function ConfidenceMeter({ value, className }: { value: number; className?: string }). value in 0..1. A thin rounded track (bg-muted) with a filled bar (bg-primary) whose width represents value, animated via transform scaleX (transform-origin left, ~0.6s ease-out, static under reduced motion) — do NOT animate the width property. A small tnum font-mono label showing value.toFixed(2). aria-label={\`Confidence \${(value*100).toFixed(0)} percent\`} and role="meter" with aria-valuenow/min/max.`,
      `(3) ${W}/components/app/leads-table.tsx — 'use client'. export function LeadsTable({ leads, onSelect }: { leads: Lead[]; onSelect: (lead: Lead) => void }). The results centerpiece. DESKTOP (md+): a real <table> with sticky header; columns: Score (<ScoreRing size={40}/>), Confidence (<ConfidenceMeter/>), Company (name font-medium + website muted text-xs), Top contact (first contact name/role; email in tnum font-mono with an email_confidence Badge: found=success, guessed=warning, unknown=default; or "—" if none), Outreach angle (truncate, muted), Flags (Badge per flag: "weak-evidence"=warning, "rejected-by-critic"=danger). Numbers right-aligned, tnum font-mono. Row hover bg-muted, cursor-pointer; clicking a row OR pressing Enter/Space on it calls onSelect(lead) (make the row a button-like element with tabIndex=0, role="button", aria-label company name, focus-visible ring). Sortable headers for Score, Confidence, Company (manage local sort state; clicking toggles asc/desc; show ChevronUp/ChevronDown). MOBILE (< md): render stacked Cards instead of a table (each: company + ScoreRing prominent, contact, angle, flags) — same onSelect behavior. Stagger rows/cards in on mount (Stagger/StaggerItem, reduced-motion aware). Import ScoreRing and ConfidenceMeter from their new sibling files. Use lucide ChevronUp, ChevronDown, ExternalLink, Mail.`,
    ].join("\n"),
  },
  {
    label: "lead-drawer+outreach-card",
    spec: [
      `Create TWO files (the drawer imports the outreach card).`,
      `(1) ${W}/components/app/outreach-card.tsx — 'use client'. export function OutreachCard({ outreach, company }: { outreach: OutreachDraft; company: string }). A Card showing the draft email: a muted "Subject" label + the subject (font-medium), a separator, the body in whitespace-pre-line text-sm leading-relaxed, and a Copy button (lucide Copy, becomes Check for ~1.5s after copying) that writes \`Subject: ...\\n\\n...body\` to navigator.clipboard and fires toast.success("Outreach copied"). Header includes a small "Draft" Badge.`,
      `(2) ${W}/components/app/lead-drawer.tsx — 'use client'. export function LeadDrawer({ lead, open, onOpenChange }: { lead: Lead | null; open: boolean; onOpenChange: (open: boolean) => void }). Use Sheet (side="right") controlled by open/onOpenChange. If !lead render an empty Sheet body. Otherwise inside a ScrollArea show: header = company name (SheetTitle) + website link (ExternalLink, target _blank rel noreferrer) ; a row with <ScoreRing score={lead.overall_score} size={56}/> + overall confidence (<ConfidenceMeter value={lead.confidence}/>) + flag Badges ; a "Scoring" section listing lead.qualification.dimensions: each row = DIMENSION_LABELS[d.dimension] || d.dimension, a small inline bar to d.score (reuse approach, but you may inline a simple track), d.score in tnum font-mono, a muted confidence (d.confidence.toFixed(2)), and the evidence text (muted, text-sm) ; matched_pain_points + signals as Badge chips ; if lead.critique: a "Critic verdict" block with a Badge (accept=success, weak=warning, reject=danger) + issues and missing_evidence as bullet lists ; if lead.recalled_context.length: a "Recalled from memory" muted list ; contacts list (name/role, email tnum font-mono + email_confidence Badge) ; and if lead.outreach: <OutreachCard outreach={lead.outreach} company={lead.company.name}/>. Import ScoreRing & ConfidenceMeter from sibling files. Scannable, premium, generous spacing.`,
    ].join("\n"),
  },
  {
    label: "metrics-bar",
    spec: `Create ${W}/components/app/metrics-bar.tsx — 'use client'. export function MetricsBar({ metrics, durationSeconds }: { metrics: RunMetrics; durationSeconds: number }). A responsive grid (2 cols mobile -> 3 -> 6) of compact KPI stat Cards: Duration (durationSeconds, suffix "s", 2 decimals), LLM calls (metrics.llm_calls), Embeds (metrics.embed_calls), Cache hits (metrics.cache_hits), Tokens (formatCompact(metrics.total_tokens)), Est. cost (formatCost(metrics.estimated_cost_usd)). Each card: a small lucide icon (Clock, Sparkles, Layers, Database, Hash, Coins) in muted, an overline-style muted label, and the value big in tnum font-mono font-semibold using <CountUp .../> for numeric values (CountUp value, decimals, suffix). The cost card adds a tiny caption "free tier: $0" in text-success. Wrap in a section with a small "Run metrics" header. Numbers are the focus.`,
  },
  {
    label: "trace-graph",
    spec: `Create ${W}/components/app/trace-graph.tsx — 'use client'. export function TraceGraph({ trace }: { trace: TraceNode }). Render the agent trace as a React Flow graph using @xyflow/react. import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge, Position } from "@xyflow/react"; and import "@xyflow/react/dist/style.css". Recursively flatten the TraceNode tree into nodes+edges: assign x by depth (e.g. depth*240) and y by a running per-depth offset so siblings stack (give each node ~70px vertical room). Node data shows node.name and node.ms ("\${ms}ms", tnum font-mono). Use a custom nodeType "step": a div styled with TOKEN classes (rounded-md border bg-surface px-3 py-2 text-foreground; the run/company nodes use border-primary or bg-primary-soft to read as the critical path; leaf step nodes muted). Include <Handle type="target" position={Position.Left}/> and <Handle type="source" position={Position.Right}/> on the custom node. Edges: type smoothstep, animated set to !reducedMotion (call useReducedMotion()). Container: a div h-[520px] w-full rounded-lg border border-border bg-background/40 overflow-hidden; <ReactFlow nodes edges nodeTypes fitView proOptions={{hideAttribution:true}}><Background/><Controls/><MiniMap className="hidden md:block"/></ReactFlow>. Style the React Flow chrome minimally. Memoize nodeTypes OUTSIDE the component (const nodeTypes = { step: StepNode }) to avoid React Flow warnings. Color nodes named "run"/"company" with the primary accent. Keep it the visual centerpiece but clean. Ensure it works client-side only (it is a 'use client' file).`,
  },
  {
    label: "empty-states",
    spec: `Create ${W}/components/app/empty-states.tsx — 'use client'. Export TWO functions. (1) export function EmptyInitial({ onPick }: { onPick: (q: string) => void }) — a centered empty state: a large faded <BrandMark className="size-12 opacity-80"/> (or a Search lucide), headline "Describe your ideal customer" (font-semibold), a muted one-liner, and EXAMPLE_QUERIES rendered as clickable chips (Button variant outline size sm) each calling onPick(query). (2) export function EmptyNoResults({ reason, minScore, found, skipped }: { reason: "no_candidates" | "all_known" | "below_gate" | null; minScore: number; found: number; skipped: number }) — a centered state with a SearchX lucide icon and a headline + body that DIFFER by reason (this is important, mirror DESIGN.md §5): no_candidates -> "No companies discovered" / suggest rephrasing or broadening ; all_known -> "All \${found} candidates already researched" / suggest a different request or clearing memory ; below_gate -> "Scanned \${found - skipped} new companies; none cleared the gate" / suggest lowering the score gate (currently \${minScore}) or broadening. Never show a generic blame message. Premium, centered, max-w-md.`,
  },
  {
    label: "command-menu",
    spec: `Create ${W}/components/app/command-menu.tsx — 'use client'. export function CommandMenu(). A command palette used in the app header. Render a trigger Button (variant outline size sm) styled like a search field: a Search icon + muted text "Search…" + a right-aligned kbd hint showing "⌘K" (a small <kbd> with border border-border rounded px-1.5 text-[10px]). Open a Dialog (from "@/components/ui/dialog") containing the cmdk palette: import { Command } from "cmdk". Listen for (e.metaKey||e.ctrlKey) && e.key==="k" globally (useEffect, preventDefault) to toggle open. Inside: Command with Command.Input (styled, placeholder "Type a command or search…"), Command.List, Command.Empty "No results.", and Command.Group(s) with Command.Item entries: "Run a search" (closes + focuses; just close for demo), "Toggle theme" (use useTheme from next-themes: setTheme(resolvedTheme==="dark"?"light":"dark")), "Go to landing page" (use next/navigation useRouter().push("/")), plus EXAMPLE_QUERIES as items under a "Try a search" group (selecting just closes for the demo). Style cmdk parts with token classes (bg-surface-2 text-foreground; items rounded-md px-2 py-2 aria-selected:bg-muted cursor-pointer; input h-11 bg-transparent outline-none). Each item has a lucide icon. Keyboard accessible (cmdk handles arrow/enter). Ensure the dialog content has a visually-hidden DialogTitle for a11y (use DialogTitle with className "sr-only").`,
  },
];

// ---- Phase 1+2: build all components in parallel (disjoint files) ----
const buildThunks = [
  ...LANDING.map((s) => () =>
    agent(FOUNDATION + "\n\n=== YOUR TASK ===\n" + s.spec, {
      label: s.label,
      phase: "Build landing",
      schema: SUMMARY_SCHEMA,
    }),
  ),
  ...APP.map((s) => () =>
    agent(FOUNDATION + "\n\n=== YOUR TASK ===\n" + s.spec, {
      label: s.label,
      phase: "Build app",
      schema: SUMMARY_SCHEMA,
    }),
  ),
];

const built = (await parallel(buildThunks)).filter(Boolean);
log(`Built ${built.length}/${buildThunks.length} component groups`);

// ---- Phase 3: adversarial design-compliance + a11y review ----
const reviewBase = [
  "You are an adversarial design-compliance + accessibility reviewer for the Leadsmith frontend.",
  "Read D:/Personal/sales agent/web/DESIGN.md, then read EVERY .tsx file in the directory below. Hunt for concrete violations only (cite file + the specific issue).",
  "Check for: hardcoded hex/rgb/hsl colors; use of bg-white/bg-black/text-black/text-gray-*/bg-gray-*/bg-slate-*/bg-neutral-* instead of tokens; any AI-purple (#6366F1/#8B5CF6 / indigo/violet); animating width/height/top/left/margin (must be transform/opacity only); missing 'use client' on files using hooks/motion/Radix/handlers; icon-only buttons without aria-label; emojis used as icons; missing useReducedMotion handling in hand-written motion (Reveal/Stagger/CountUp are already safe); score/status shown by color ONLY with no number/label; imports from 'framer-motion' (must be 'motion/react'); obviously broken imports (paths not in the foundation list).",
  "Do NOT fix anything. Return a precise violations list (high/medium/low) and a one-line summary.",
].join("\n");

const reviews = (
  await parallel([
    () =>
      agent(reviewBase + "\n\nDIRECTORY TO AUDIT: D:/Personal/sales agent/web/components/landing", {
        label: "review:landing",
        phase: "Review",
        schema: REVIEW_SCHEMA,
      }),
    () =>
      agent(reviewBase + "\n\nDIRECTORY TO AUDIT: D:/Personal/sales agent/web/components/app", {
        label: "review:app",
        phase: "Review",
        schema: REVIEW_SCHEMA,
      }),
  ])
).filter(Boolean);

return { built, reviews };
