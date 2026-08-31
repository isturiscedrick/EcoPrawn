import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve conflicting Tailwind
 * utility classes (e.g. "px-2" vs "px-4") in favor of the last one.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
