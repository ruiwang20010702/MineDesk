import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn - Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

