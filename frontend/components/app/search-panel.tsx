"use client";

import * as React from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_FLAGS, type RunFlags } from "@/lib/types";
import { EXAMPLE_QUERIES } from "@/lib/marketing-content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface SearchPanelProps {
  onRun: (request: string, flags: RunFlags) => void;
  running: boolean;
  onCancel: () => void;
}

const TOGGLES: {
  key: "outreach" | "critic" | "trace";
  label: string;
  hint: string;
}[] = [
  {
    key: "critic",
    label: "Critic review",
    hint: "Challenge weak matches before they reach the list",
  },
  {
    key: "outreach",
    label: "Draft outreach",
    hint: "Write a first message from the evidence",
  },
  {
    key: "trace",
    label: "Live trace",
    hint: "Record agent states, timings, and warnings",
  },
];

const MODES: { value: "customer" | "product"; label: string; hint: string }[] =
  [
    {
      value: "customer",
      label: "Target search",
      hint: "Describe the companies you want",
    },
    {
      value: "product",
      label: "Product search",
      hint: "Paste a product URL or describe an offer",
    },
  ];

const WORKFLOW = [
  {
    icon: FileText,
    label: "Profile",
    body: "Extract buyer, pain, role, region, and timing clues",
  },
  {
    icon: Search,
    label: "Discover",
    body: "Search public signals for matching companies",
  },
  {
    icon: ShieldCheck,
    label: "Qualify",
    body: "Score fit, attach evidence, and challenge weak matches",
  },
];

const OUTPUTS = [
  "Fit-ranked company list",
  "Evidence and confidence per account",
  "Contact direction and first-message angle",
];

function looksLikeUrl(s: string): boolean {
  return /https?:\/\/\S+|\b[a-z0-9-]+\.(?:com|org|net|io|ai|co|dev|app|so|sh|tech|cloud)\b/i.test(
    s,
  );
}

function SettingSummary({
  flags,
  activeToggles,
}: {
  flags: RunFlags;
  activeToggles: number;
}) {
  return (
    <span className="tnum hidden font-mono text-[11px] text-muted-foreground sm:inline">
      {flags.targetLeads} leads / min {flags.minScore}
      {activeToggles > 0 ? ` / ${activeToggles} checks` : ""}
    </span>
  );
}

export function SearchPanel({ onRun, running, onCancel }: SearchPanelProps) {
  const [request, setRequest] = React.useState("");
  const [flags, setFlags] = React.useState<RunFlags>(DEFAULT_FLAGS);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const trimmed = request.trim();
  const canSubmit = trimmed.length > 0 && !running;
  const urlDetected = looksLikeUrl(trimmed);
  const effectiveMode: "customer" | "product" =
    flags.mode === "auto" ? (urlDetected ? "product" : "customer") : flags.mode;
  const activeToggles = TOGGLES.filter((t) => flags[t.key]).length;

  const submit = React.useCallback(() => {
    const value = request.trim();
    if (!value || running) return;
    onRun(value, flags);
  }, [request, running, flags, onRun]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  const applyExample = (q: string) => {
    setRequest(q);
    textareaRef.current?.focus();
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Hero */}
      <div className="mb-8 text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/70">
          Multi-agent engine
        </p>
        <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">
          Build a pipeline from
          <br />
          plain English.
        </h1>
        <p className="mx-auto mt-4 max-w-[42ch] text-[15px] leading-[1.6] text-muted-foreground">
          Describe a market, hiring trigger, or technology signal. Leadsmith
          turns it into a ranked list you can inspect.
        </p>
      </div>

      {/* Composer */}
      <div className="overflow-hidden rounded-2xl premium-panel">
        {/* Mode selector */}
        <div className="flex items-center gap-2 border-b border-border px-6 py-3">
          {MODES.map((m) => {
            const active = effectiveMode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setFlags((f) => ({ ...f, mode: m.value }))}
                disabled={running}
                aria-pressed={active}
                title={m.hint}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium outline-none transition-all duration-150",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            );
          })}

          <div className="flex-1" />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={running}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <SlidersHorizontal className="size-3.5" aria-hidden />
                <span className="text-[12px]">Controls</span>
                <SettingSummary flags={flags} activeToggles={activeToggles} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="flag-target" className="text-[13px]">
                      Target qualified leads
                    </Label>
                    <span className="tnum font-mono text-[13px] text-foreground">
                      {flags.targetLeads}
                    </span>
                  </div>
                  <Slider
                    id="flag-target"
                    value={[flags.targetLeads]}
                    onValueChange={([v]) =>
                      setFlags((f) => ({ ...f, targetLeads: v }))
                    }
                    min={1}
                    max={8}
                    step={1}
                    aria-label="Number of qualified leads to find"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="flag-min-score" className="text-[13px]">
                      Minimum score
                    </Label>
                    <span className="tnum font-mono text-[13px] text-foreground">
                      {flags.minScore}
                    </span>
                  </div>
                  <Slider
                    id="flag-min-score"
                    value={[flags.minScore]}
                    onValueChange={([v]) =>
                      setFlags((f) => ({ ...f, minScore: v }))
                    }
                    min={0}
                    max={100}
                    step={5}
                    aria-label="Minimum qualifying score"
                  />
                </div>

                <div className="flex flex-col gap-4 border-t border-border pt-4">
                  {TOGGLES.map(({ key, label, hint }) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="flex flex-col gap-0.5">
                        <Label
                          htmlFor={`flag-${key}`}
                          className="cursor-pointer text-[13px]"
                        >
                          {label}
                        </Label>
                        <span className="text-[12px] text-muted-foreground">
                          {hint}
                        </span>
                      </div>
                      <Switch
                        id={`flag-${key}`}
                        checked={flags[key]}
                        onCheckedChange={(checked) =>
                          setFlags((f) => ({ ...f, [key]: checked }))
                        }
                        aria-label={label}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Textarea */}
        <Label htmlFor="search-request" className="sr-only">
          Describe who you want to find
        </Label>
        <div className="relative">
          <Textarea
            id="search-request"
            ref={textareaRef}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="B2B SaaS companies hiring their first RevOps lead"
            className="min-h-[220px] resize-none border-0 bg-transparent px-6 py-8 text-lg font-medium leading-[1.65] shadow-none placeholder:text-muted-foreground/50 focus-visible:border-0 focus-visible:outline-none"
            aria-describedby="search-hint"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-border bg-muted/30 px-6 py-3.5">
          <p
            id="search-hint"
            className="flex-1 text-[12px] text-muted-foreground/60"
          >
            {effectiveMode === "product"
              ? "Reads the offer first, then finds companies that need it."
              : "Starts from your description and builds the buyer profile."}
          </p>

          <div className="flex items-center gap-2">
            {running ? (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="gap-2"
              aria-busy={running}
            >
              {running ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Searching
                </>
              ) : (
                <>
                  <Search className="size-4" aria-hidden />
                  Build pipeline
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Example queries */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {EXAMPLE_QUERIES.map((q) => (
          <Button
            key={q}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyExample(q)}
            disabled={running}
            className="h-auto whitespace-normal rounded-full py-1.5 text-[12px] font-normal text-muted-foreground transition-all duration-150 hover:text-foreground"
          >
            {q}
          </Button>
        ))}
      </div>

      {/* Workflow preview */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {WORKFLOW.map((step, index) => (
          <div
            key={step.label}
            className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:border-border hover:bg-muted/30"
          >
            <span className="tnum flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-[11px] font-bold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                <step.icon className="size-3.5 text-primary/70" aria-hidden />
                {step.label}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Output */}
      <div className="mt-4 rounded-xl border border-primary/10 bg-primary-soft p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
          Output
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {OUTPUTS.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2
                className="mt-0.5 size-3.5 shrink-0 text-primary/70"
                aria-hidden
              />
              <p className="text-[13px] leading-relaxed text-foreground/70">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
