import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind class names. Falsy values are skipped and conflicting
 * classes are resolved, e.g. cn("px-2", big && "px-4") -> "px-4" when big.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
