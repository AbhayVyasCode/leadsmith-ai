import { Activity } from "lucide-react";
import type { CSSProperties } from "react";
import type { TraceNode } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

const NAMES: Record<string, string> = {
  product: "Read product site",
  intent: "Build buyer profile",
  recall: "Recall from memory",
  discovery: "Search the web",
  company: "Research company",
  scrape: "Read site",
  qualify: "Score fit",
  critic: "Critic review",
  enrich: "Find people",
  outreach: "Draft email",
};

function label(node: TraceNode) {
  const base = NAMES[node.name] ?? node.name;
  if (node.name === "company" && node.attrs?.name) return String(node.attrs.name);
  if (node.name === "discovery" && node.attrs?.wave) return `${base} · wave ${node.attrs.wave}`;
  return base;
}

function Bar({ ms, max }: { ms: number; max: number }) {
  return (
    <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-panel-2">
      <span
        className="absolute inset-y-0 left-0 rounded-full bg-steel"
        style={{ width: `${Math.max(1.5, (ms / max) * 100)}%` } as CSSProperties}
      />
    </span>
  );
}

function Row({ node, max, depth }: { node: TraceNode; max: number; depth: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,13rem)_1fr_4.5rem] items-center gap-4 py-1.5" style={{ paddingLeft: depth * 16 }}>
      <span className="truncate text-[0.84rem] text-ink-2">{label(node)}</span>
      <Bar ms={node.ms} max={max} />
      <span className="text-right font-mono text-[0.74rem] text-ink-3 tnum">{formatDuration(node.ms / 1000)}</span>
    </div>
  );
}

/** The run's real span tree as a flame list: top-level steps, companies expandable. */
export function TraceView({ trace }: { trace: TraceNode }) {
  const max = Math.max(1, ...trace.children.map((c) => c.ms));
  return (
    <section aria-labelledby="trace-title" className="card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 sm:px-6">
        <h2 id="trace-title" className="flex items-center gap-2 font-medium text-ink">
          <Activity className="size-4 text-ember-ink" aria-hidden />
          Run trace
        </h2>
        <span className="font-mono text-[0.75rem] text-ink-3">total {formatDuration(trace.ms / 1000)}</span>
      </div>
      <div className="px-5 py-4 sm:px-6">
        {trace.children.map((node, i) =>
          node.children.length ? (
            <details key={i} className="group">
              <summary className="cursor-pointer list-none rounded-lg marker:hidden [&::-webkit-details-marker]:hidden hover:bg-panel-2/50">
                <Row node={node} max={max} depth={0} />
              </summary>
              <div className="pb-2">
                {node.children.map((child, j) => (
                  <Row key={j} node={child} max={max} depth={1} />
                ))}
              </div>
            </details>
          ) : (
            <Row key={i} node={node} max={max} depth={0} />
          ),
        )}
      </div>
    </section>
  );
}
