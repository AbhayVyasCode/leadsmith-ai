"use client";

import Link from "next/link";
import { ArrowRight, Globe, History, Users } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { describeEngine, EngineDot, useEngine } from "@/components/app/engine";
import { RunSettings } from "@/components/app/run-settings";
import { ArrowGlyph, Button } from "@/components/ui/button";
import { leadsmith } from "@/lib/leadsmith-client";
import { EXAMPLE_BRIEFS } from "@/lib/mock-data";
import type { RunFlags, RunSummary } from "@/lib/types";
import { cn } from "@/lib/cn";
import { radioGroupKeys } from "@/lib/a11y";
import { formatRelative } from "@/lib/utils";
import s from "./composer.module.css";

/** Mirrors the backend's product-URL detection (explicit URL or a bare known-TLD domain). */
export function looksLikeUrl(text: string): boolean {
  return /https?:\/\/\S+|\b(?:[a-z0-9-]+\.)+(?:com|org|net|io|ai|co|dev|app|so|sh|tech|cloud|xyz|tools|site|in|uk|de|eu|us)\b/i.test(text);
}

const MODES = [
  { value: "customer", label: "Describe customers", short: "Customers", icon: Users },
  { value: "product", label: "Start from my product", short: "My product", icon: Globe },
] as const;
const MODE_VALUES = MODES.map((m) => m.value);

function EngineNotice() {
  const { health } = useEngine();
  if (!health || (health.mode === "live" && health.reachable && health.missing.length === 0)) return null;
  const { tone, label } = describeEngine(health);
  return (
    <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-panel p-4 text-[0.9rem]">
      <EngineDot tone={tone} className="mt-1.5" />
      <div className="min-w-0 text-ink-2">
        <p className="font-medium text-ink">{label}</p>
        {health.mode === "demo" ? (
          <p className="mt-1">
            Runs use sample data. Set <code className="font-mono text-[0.8rem] text-ink">NEXT_PUBLIC_LEADSMITH_API</code> to use the real engine.
          </p>
        ) : !health.reachable ? (
          <p className="mt-1">
            Start it from <code className="font-mono text-[0.8rem] text-ink">backend/</code> with{" "}
            <code className="font-mono text-[0.8rem] text-ink">uvicorn server:app --port 8000</code>, then try again.
          </p>
        ) : (
          <p className="mt-1">
            Add <code className="font-mono text-[0.8rem] text-ink">{health.missing.join(", ")}</code> to{" "}
            <code className="font-mono text-[0.8rem] text-ink">backend/.env</code> and restart the engine.
          </p>
        )}
      </div>
    </div>
  );
}

function RecentRuns() {
  const [runs, setRuns] = useState<RunSummary[] | null>(null);
  useEffect(() => {
    let alive = true;
    leadsmith
      .getRuns(4)
      .then((r) => alive && setRuns(r.items))
      .catch(() => alive && setRuns([]));
    return () => {
      alive = false;
    };
  }, []);
  if (!runs?.length) return null;
  return (
    <section aria-labelledby="recent-title" className="mt-14">
      <div className="flex items-baseline justify-between">
        <h2 id="recent-title" className="eyebrow text-ink-3">
          Recent runs
        </h2>
        <Link href="/app/runs" className="link-underline text-sm text-ink-2 hover:text-ink">
          All runs
        </Link>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-2">
        {runs.map((run) => (
          <li key={run.id}>
            <Link
              href={`/app?run=${encodeURIComponent(run.id)}`}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-panel px-4 py-3.5 transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-line-2"
            >
              <History className="size-4 shrink-0 text-ink-3" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-[0.95rem] text-ink">{run.request}</span>
              <span className="hidden shrink-0 font-mono text-xs text-ink-3 sm:inline">
                {run.leads_count} leads · {formatRelative(run.created_at)}
              </span>
              <ArrowRight className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Composer({
  value,
  onChange,
  flags,
  onFlagsChange,
  onSubmit,
  notice,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  flags: RunFlags;
  onFlagsChange: (flags: RunFlags) => void;
  onSubmit: (brief: string) => void;
  notice?: string | null;
  /** Focus the brief with the cursor at the end (e.g. arriving with a pre-filled brief). */
  autoFocus?: boolean;
}) {
  const briefRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = briefRef.current;
    if (!autoFocus || !el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [autoFocus]);

  const product = flags.mode === "product";
  const trimmed = value.trim();
  const isUrl = looksLikeUrl(trimmed);
  const needsUrl = product && trimmed.length > 0 && !isUrl;
  const canSubmit = trimmed.length > 0 && !needsUrl;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (canSubmit) onSubmit(trimmed);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
  };
  const setMode = (mode: RunFlags["mode"]) => onFlagsChange({ ...flags, mode });

  return (
    <div className="relative isolate">
      <div aria-hidden className={s.backdrop} />
      <section className="mx-auto max-w-[880px] px-4 pb-16 pt-10 sm:px-6 lg:pt-20">
        {notice ? (
          <p role="alert" className="mb-8 rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3 text-[0.9rem] text-ink">
            {notice}
          </p>
        ) : null}
        <p className={cn("eyebrow flex items-center gap-2.5 text-ink-3", s.rise)}>
          <span className="live-dot" />
          New research
        </p>
        <h1 className={cn("mt-4 font-display text-[clamp(2.6rem,6.4vw,4.6rem)] leading-[0.98] tracking-[-0.022em] text-ink", s.rise)}>
          Who do you want to <em className="text-ember-ink">sell to?</em>
        </h1>
        <p className={cn("mt-4 max-w-[54ch] text-lg text-ink-2", s.rise)}>
          Describe your ideal customer in one sentence — or start from your product’s URL and let Leadsmith work out who
          buys it.
        </p>

        <form onSubmit={submit} className={cn(s.card, s.rise)} aria-label="New research">
          <div
            role="radiogroup"
            aria-label="Search mode"
            onKeyDown={(e) => radioGroupKeys<RunFlags["mode"]>(e, MODE_VALUES, flags.mode, setMode)}
            className="flex gap-1 border-b border-line p-2"
          >
            {MODES.map(({ value: mode, label, short, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={flags.mode === mode}
                tabIndex={flags.mode === mode ? 0 : -1}
                onClick={() => setMode(mode)}
                className={s.mode}
              >
                <Icon className="size-4" aria-hidden />
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <label htmlFor="brief" className="sr-only">
            {product ? "Your product’s URL" : "Describe who you want to find"}
          </label>
          <textarea
            ref={briefRef}
            id="brief"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            spellCheck={!product}
            placeholder={
              product
                ? "https://yourproduct.com — we’ll read it and find companies that would buy it"
                : "e.g. Series A fintechs in the US without a public security page"
            }
            aria-describedby="brief-hint"
            aria-invalid={needsUrl || undefined}
            className={s.textarea}
          />

          <p id="brief-hint" className="min-h-6 px-6 text-[0.82rem]">
            {needsUrl ? (
              <span className="text-bad">Paste your product’s URL — Leadsmith reads your site to work out who buys it.</span>
            ) : !product && isUrl ? (
              <span className="text-ink-2">
                That looks like a URL.{" "}
                <button type="button" onClick={() => setMode("product")} className="font-medium text-ember-ink underline underline-offset-2">
                  Find this product’s buyers instead
                </button>
              </span>
            ) : null}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-panel-2/40 px-3 py-3 sm:px-4">
            <RunSettings flags={flags} onChange={onFlagsChange} />
            <div className="flex items-center gap-3">
              <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[0.7rem] text-ink-3 sm:inline">Ctrl ↵</kbd>
              <Button type="submit" disabled={!canSubmit}>
                Start research
                <ArrowGlyph />
              </Button>
            </div>
          </div>
        </form>

        <div className={cn("mt-6 flex flex-wrap items-center gap-2", s.rise)}>
          <span className="eyebrow mr-1 text-ink-3">Try</span>
          {EXAMPLE_BRIEFS[product ? "product" : "customer"].map((brief) => (
            <button
              key={brief}
              type="button"
              onClick={() => onChange(brief)}
              className="rounded-full border border-line bg-panel px-3.5 py-1.5 text-left text-[0.82rem] text-ink-2 transition-colors hover:border-line-2 hover:text-ink"
            >
              {brief}
            </button>
          ))}
        </div>

        <EngineNotice />
        <RecentRuns />
      </section>
    </div>
  );
}
