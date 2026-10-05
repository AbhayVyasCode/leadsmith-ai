import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import s from "./meter.module.css";

/** Evidence confidence (0–1). Steel, deliberately distinct from fit-score colors. */
export function ConfidenceMeter({
  value,
  showValue = true,
  className,
}: {
  value: number;
  showValue?: boolean;
  className?: string;
}) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const pct = Math.round(v * 100);
  return (
    <span
      role="meter"
      aria-label={`Evidence confidence ${pct}%`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn(s.meter, className)}
    >
      <span className={s.track}>
        <span className={s.fill} style={{ "--v": v } as CSSProperties} />
      </span>
      {showValue ? <span className={s.value}>{v.toFixed(2)}</span> : null}
    </span>
  );
}
