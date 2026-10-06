import Link from "next/link";
import { cn } from "@/lib/cn";
import s from "./logo.module.css";

/**
 * The Leadsmith mark: a research agent inside a magnifier. Decorative — the
 * wordmark (or a nearby label) always names it.
 */
export function LogoMark({ className }: { className?: string }) {
  return <span aria-hidden className={cn(s.mark, "size-9", className)} />;
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Leadsmith home"
      className={cn("group inline-flex items-center gap-2.5 rounded-full text-ink outline-none", className)}
    >
      <LogoMark className="transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6" />
      <span className="font-display text-[1.6rem] leading-none tracking-[-0.01em]">Leadsmith</span>
    </Link>
  );
}
