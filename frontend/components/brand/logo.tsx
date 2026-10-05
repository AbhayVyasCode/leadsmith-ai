import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * The Leadsmith mark: a lead INGOT (the metal — "lead"-smith) struck by an
 * ember spark. Ink ingot follows currentColor; the spark is always ember.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7 shrink-0", className)} aria-hidden>
      <path d="M9.2 14.2h13.6l5.4 12.3H3.8z" fill="currentColor" />
      <path d="M10.4 16.6h11.2l.75 1.75H9.65z" fill="var(--canvas)" opacity=".22" />
      <path
        d="M22.5 2.4c.45 3.1 1.6 4.3 4.7 4.75-3.1.45-4.25 1.65-4.7 4.75-.45-3.1-1.6-4.3-4.7-4.75 3.1-.45 4.25-1.65 4.7-4.75z"
        fill="var(--ember)"
      />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Leadsmith home"
      className={cn("group inline-flex items-center gap-2 rounded-full text-ink outline-none", className)}
    >
      <LogoMark className="transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6" />
      <span className="font-display text-[1.6rem] leading-none tracking-[-0.01em]">Leadsmith</span>
    </Link>
  );
}
