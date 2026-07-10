import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page-width content container — 1280px max, responsive gutters. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1280px] px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

/**
 * Semantic marketing section with consistent vertical rhythm (~80px desktop)
 * and a sticky-nav scroll offset for in-page anchors.
 */
export function Section({
  children,
  id,
  className,
  containerClassName,
  py = "default",
  container = true,
  as: Tag = "section",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  py?: "default" | "sm" | "lg" | "none";
  container?: boolean;
  as?: "section" | "div";
}) {
  const pad =
    py === "none"
      ? ""
      : py === "sm"
        ? "py-10 sm:py-12 lg:py-14"
        : py === "lg"
          ? "py-20 sm:py-24 lg:py-28"
          : "py-14 sm:py-16 lg:py-20";

  return (
    <Tag
      id={id}
      className={cn("relative scroll-mt-24", pad, className)}
    >
      {container ? (
        <Container className={containerClassName}>{children}</Container>
      ) : (
        children
      )}
    </Tag>
  );
}
