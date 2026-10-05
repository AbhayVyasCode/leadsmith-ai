"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { clsx } from "clsx";

type StepRef = { id: string; n: string; name: string };

/** Sticky step index that follows whichever step card is crossing the viewport's middle band. */
export function StepIndex({ steps }: { steps: StepRef[] }) {
  const [active, setActive] = useState(steps[0]?.id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id.replace("step-", ""));
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    for (const step of steps) {
      const el = document.getElementById(`step-${step.id}`);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [steps]);

  const index = Math.max(0, steps.findIndex((s) => s.id === active));

  return (
    <nav aria-label="Pipeline steps" className="relative mt-12 hidden lg:block">
      <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-line" />
      <span
        aria-hidden
        className="absolute left-[5px] top-2 w-px origin-top bg-ember transition-transform duration-500 ease-[var(--ease-ember)]"
        style={{ height: "calc(100% - 1rem)", transform: `scaleY(${steps.length > 1 ? index / (steps.length - 1) : 1})` } as CSSProperties}
      />
      <ol className="space-y-1">
        {steps.map((step, i) => {
          const on = step.id === active;
          return (
            <li key={step.id}>
              <a
                href={`#step-${step.id}`}
                aria-current={on ? "step" : undefined}
                className="group flex items-center gap-4 rounded-lg py-2 pr-3 outline-none"
              >
                <span
                  aria-hidden
                  className={clsx(
                    "relative z-10 size-[11px] shrink-0 rounded-full border-2 transition-all duration-300",
                    i <= index ? "border-ember bg-ember" : "border-line-2 bg-canvas",
                    on && "scale-125 shadow-[0_0_0_5px_color-mix(in_oklab,var(--ember)_18%,transparent)]",
                  )}
                />
                <span className={clsx("font-mono text-xs transition-colors", on ? "text-ember-ink" : "text-ink-3")}>{step.n}</span>
                <span
                  className={clsx(
                    "font-display text-[1.65rem] leading-none transition-colors duration-300",
                    on ? "text-ink" : "text-ink-3 group-hover:text-ink-2",
                  )}
                >
                  {step.name}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
