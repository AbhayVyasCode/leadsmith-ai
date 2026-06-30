import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reading column for blog articles and legal pages. Applies the `.prose-ls`
 * typographic styles (defined in globals.css) — 65ch, 18px body, 1.7 leading.
 */
export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("prose-ls", className)}>{children}</div>;
}
