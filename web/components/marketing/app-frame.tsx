import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Browser/app "chrome" frame for product mockups. Wrap a static recreation of
 * the app UI to make marketing pages feel like real product shots.
 */
export function AppFrame({
  children,
  label = "app.getleadsmith.ai",
  className,
  glow = false,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-lg",
        "dark:shadow-none dark:ring-1 dark:ring-white/5",
        glow &&
          "dark:shadow-[0_0_0_1px_var(--primary-soft),0_24px_64px_-24px_var(--primary-soft)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full bg-border" />
          <span className="size-3 rounded-full bg-border" />
          <span className="size-3 rounded-full bg-border" />
        </span>
        {label ? (
          <span className="ml-2 truncate font-mono text-xs text-muted-foreground">
            {label}
          </span>
        ) : null}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
