import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Surface card with an icon tile, used in feature grids/bento. Subtle hover lift. */
export function FeatureCard({
  icon,
  title,
  children,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md dark:hover:shadow-none",
        className,
      )}
    >
      {icon ? (
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary [&_svg]:size-5">
          {icon}
        </div>
      ) : null}
      <h3 className="mt-4 text-base font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </h3>
      {children ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {children}
        </p>
      ) : null}
    </div>
  );
}
