import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Uppercase overline chip used above section headings. */
export function Eyebrow({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-primary [&_svg]:size-3.5",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
