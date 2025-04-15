import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string without currency symbol
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace(/[^\d.,]/g, '');
}

/**
 * Format a date as a readable string
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if it's today
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Check if it's yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Otherwise, return full date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate percentage safely
 * @param value The current value
 * @param total The total value
 * @returns Percentage as a number between 0-100
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return Math.min(Math.round(percentage), 100);
}

/**
 * Group transactions by date
 * @param transactions Array of transactions
 * @returns Transactions grouped by date
 */
export function groupTransactionsByDate<T extends { date: Date | string }>(
  transactions: T[]
): Record<string, T[]> {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Format money amount input
 * @param value Current value
 * @returns Formatted value
 */
export function formatMoneyInput(value: string): string {
  // Remove all non-numeric characters except decimal point
  let formatted = value.replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const parts = formatted.split('.');
  if (parts.length > 2) {
    formatted = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 2 decimal places
  if (formatted.includes('.')) {
    const [integer, decimal] = formatted.split('.');
    formatted = integer + '.' + decimal.slice(0, 2);
  }
  
  return formatted;
}
