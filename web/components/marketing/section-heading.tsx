import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/marketing/eyebrow";

/**
 * Standard section header: optional eyebrow, fluid display title, lead paragraph.
 * Presentational + server-safe — wrap in <Reveal> at the call site for motion.
 */
export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  lead,
  align = "center",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: ReactNode;
  eyebrowIcon?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: "center" | "left";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "max-w-2xl items-start text-left",
        className,
      )}
    >
      {eyebrow ? <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow> : null}
      <Tag className="font-display text-balance text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-foreground">
        {title}
      </Tag>
      {lead ? (
        <p
          className={cn(
            "text-balance text-lg leading-relaxed text-muted-foreground",
            align === "center" ? "max-w-[52ch]" : "max-w-[56ch]",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
