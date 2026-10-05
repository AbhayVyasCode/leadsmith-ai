import type { KeyboardEvent } from "react";

const RADIO_STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * WAI-ARIA radiogroup keyboard support: put this on the `role="radiogroup"`
 * element and give each radio `tabIndex={checked ? 0 : -1}`. Arrow keys move
 * focus and selection together, wrapping at the ends.
 */
export function radioGroupKeys<T>(e: KeyboardEvent<HTMLElement>, values: readonly T[], current: T, select: (value: T) => void) {
  const step = RADIO_STEP[e.key];
  if (!step) return;
  e.preventDefault();
  const index = (Math.max(0, values.indexOf(current)) + step + values.length) % values.length;
  select(values[index]);
  e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')[index]?.focus();
}
