import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with clsx
 * This is the foundation utility for shadcn/ui components
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
