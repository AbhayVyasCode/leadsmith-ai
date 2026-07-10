import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Leadsmith AI logomark — "The Forge Spark".
 *
 * A vertical-dominant, four-point concave spark with a small offset secondary
 * spark (sparks flying) — reads as a forge spark + a node in the agent graph.
 * Duotone via the `--primary` token: theme-aware, server-safe, and free of
 * SVG gradient-id collisions when rendered many times on a page.
 */
export function BrandMark({
  className,
  glow = false,
}: {
  className?: string;
  glow?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "size-6 shrink-0",
        glow && "[filter:drop-shadow(0_0_8px_var(--primary-soft))]",
        className,
      )}
      fill="none"
      aria-hidden="true"
    >
      {/* main spark — taller than wide (vertical-dominant) */}
      <path
        d="M9.5 1.5 Q11.9 10.6 15.5 13 Q11.9 15.4 9.5 22.5 Q7.1 15.4 3.5 13 Q7.1 10.6 9.5 1.5 Z"
        fill="var(--primary)"
      />
      {/* secondary spark, offset upper-right */}
      <path
        d="M18.5 2 Q19.6 4.4 21.5 5.5 Q19.6 6.6 18.5 9 Q17.4 6.6 15.5 5.5 Q17.4 4.4 18.5 2 Z"
        fill="var(--primary)"
        opacity="0.55"
      />
    </svg>
  );
}

/** Wordmark "Leadsmith AI" — Geist 600, tight tracking, "AI" carries the accent. */
export function BrandWordmark({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-semibold tracking-[-0.03em] text-foreground",
        className,
      )}
    >
      Leadsmith<span className="text-primary">&nbsp;AI</span>
    </span>
  );
}

/** Horizontal lockup: mark + wordmark. Optional link wrapper. */
export function Brand({
  className,
  href,
  size = "md",
  showWordmark = true,
  glow = false,
}: {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  glow?: boolean;
}) {
  const mark = size === "sm" ? "size-5" : size === "lg" ? "size-7" : "size-6";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-xl" : "text-lg";

  const inner = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark className={mark} glow={glow} />
      {showWordmark && <BrandWordmark className={text} />}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`${href === "/" ? "Leadsmith AI — home" : "Leadsmith AI"}`}
        className="inline-flex rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
