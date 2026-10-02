import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number, currencyCode = 'EUR'): string {
  if (amount === undefined || amount === null) return 'Price on Request';
  try {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `€${amount.toLocaleString()}`;
  }
}
