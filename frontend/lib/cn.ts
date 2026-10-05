import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Join classes and resolve Tailwind conflicts, for components that accept a
 * `className` override. Marketing-page client islands use plain `clsx` instead,
 * which keeps tailwind-merge out of the landing-page bundle.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
