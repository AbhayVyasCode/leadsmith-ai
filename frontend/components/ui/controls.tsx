import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import s from "./controls.module.css";

/** Native checkbox rendered as a switch — keyboard, form and AT support for free. */
export function Switch({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label htmlFor={id} className={cn(s.switchRow, disabled && s.disabled)}>
      <span className="min-w-0">
        <span className="block text-[0.92rem] font-medium text-ink">{label}</span>
        {description ? <span className="mt-0.5 block text-[0.8rem] leading-snug text-ink-3">{description}</span> : null}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className={s.switch}
      />
    </label>
  );
}

/** Native range input with an ember progress fill. */
export function Range({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onValueChange,
  format = (v) => String(v),
}: {
  id: string;
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="grid grid-cols-1 gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.92rem] font-medium text-ink">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-sm text-ink tnum">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className={s.range}
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-panel-2", className)} />;
}
