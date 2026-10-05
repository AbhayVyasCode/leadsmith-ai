import { clsx } from "clsx";
import type { ReactNode } from "react";

/** Editorial section header: numbered mono kicker, serif title, optional lead. */
export function SectionHeading({
  id,
  index,
  kicker,
  title,
  lead,
  center = false,
  className,
}: {
  id?: string;
  index: string;
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("reveal", center && "mx-auto text-center", className)}>
      <p className={clsx("eyebrow flex items-center gap-3 text-ink-3", center && "justify-center")}>
        <span className="text-ember-ink">{index}</span>
        <span aria-hidden className="h-px w-8 bg-line-2" />
        {kicker}
      </p>
      <h2
        id={id}
        className="mt-5 font-display text-[clamp(2.5rem,5.4vw,4.6rem)] leading-[0.98] tracking-[-0.022em] text-ink [&_em]:text-ember-ink"
      >
        {title}
      </h2>
      {lead ? (
        <p className={clsx("mt-6 max-w-[56ch] text-lg leading-relaxed text-ink-2", center && "mx-auto")}>{lead}</p>
      ) : null}
    </div>
  );
}
