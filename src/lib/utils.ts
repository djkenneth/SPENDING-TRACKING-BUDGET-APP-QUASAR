import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Configure for tw- prefix
const twMerge = extendTailwindMerge({
  prefix: 'tw:',
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
