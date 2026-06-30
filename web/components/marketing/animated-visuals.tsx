"use client";

import * as React from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import {
  Brain,
  Check,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AGENTS = [
  { key: "intent", label: "Intent", icon: Brain },
  { key: "discovery", label: "Discovery", icon: Search },
  { key: "qualify", label: "Qualify", icon: Target },
  { key: "critic", label: "Critic", icon: ShieldCheck },
  { key: "enrich", label: "Enrich", icon: Sparkles },
  { key: "outreach", label: "Outreach", icon: Mail },
] as const;

/**
 * The six agents lighting up in sequence (pending → running → done), once, when
 * scrolled into view. Under reduced motion all steps render "done" instantly.
 */
export function PipelineStrip({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(-1);

  React.useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setActive(AGENTS.length);
      return;
    }
    let i = 0;
    setActive(0);
    const id = setInterval(() => {
      i += 1;
      setActive(i);
      if (i >= AGENTS.length) clearInterval(id);
    }, 460);
    return () => clearInterval(id);
  }, [inView, reduced]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-2",
        orientation === "horizontal"
          ? "flex-col sm:flex-row sm:flex-wrap sm:items-center"
          : "flex-col",
        className,
      )}
    >
      {AGENTS.map((a, i) => {
        const status = i < active ? "done" : i === active ? "running" : "pending";
        const Icon = a.icon;
        return (
          <React.Fragment key={a.key}>
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors duration-300",
                status === "done" && "border-success/30 bg-success-soft",
                status === "running" && "border-primary/40 bg-primary-soft",
                status === "pending" && "border-border bg-surface",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center [&_svg]:size-3.5",
                  status === "done" && "text-success",
                  status === "running" && "text-primary",
                  status === "pending" && "text-muted-foreground",
                )}
              >
                {status === "running" && !reduced ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : status === "done" ? (
                  <Check aria-hidden />
                ) : (
                  <Icon aria-hidden />
                )}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  status === "pending" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {a.label}
              </span>
            </div>
            {orientation === "horizontal" && i < AGENTS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "hidden h-px w-4 shrink-0 sm:block",
                  i < active ? "bg-success/50" : "bg-border",
                )}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/** Hero NL search field — cycles example queries with a blinking caret. */
export function SearchMock({
  queries,
  className,
}: {
  queries: string[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (reduced || queries.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % queries.length), 3400);
    return () => clearInterval(id);
  }, [reduced, queries.length]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-left shadow-sm",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="relative min-w-0 flex-1">
        {reduced ? (
          <span className="block truncate font-mono text-sm text-foreground sm:text-[0.95rem]">
            {queries[0]}
          </span>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={idx}
              className="block truncate font-mono text-sm text-foreground sm:text-[0.95rem]"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              {queries[idx]}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
      {reduced ? (
        <span aria-hidden className="h-5 w-px shrink-0 bg-primary" />
      ) : (
        <motion.span
          aria-hidden
          className="h-5 w-px shrink-0 bg-primary"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1.1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }}
        />
      )}
      <span className="hidden shrink-0 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground sm:inline-flex">
        Find leads
      </span>
    </div>
  );
}
