import { Category } from "@/types";

// Default categories for the application
export const defaultCategories: Category[] = [
  {
    id: 1,
    name: 'Food & Drinks',
    icon: 'restaurant',
    color: '#ff9800',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 2,
    name: 'Shopping',
    icon: 'shopping_bag',
    color: '#2196f3',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 3,
    name: 'Transportation',
    icon: 'directions_car',
    color: '#3f51b5',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 4,
    name: 'Bills & Utilities',
    icon: 'receipt',
    color: '#f44336',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 5,
    name: 'Entertainment',
    icon: 'movie',
    color: '#9c27b0',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 6,
    name: 'Health',
    icon: 'favorite',
    color: '#4caf50',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 7,
    name: 'Salary',
    icon: 'payments',
    color: '#4caf50',
    isDefault: true,
    createdAt: new Date()
  },
];

// Category icons mapping
export const categoryIcons: Record<string, string> = {
  'Food & Drinks': 'restaurant',
  'Shopping': 'shopping_bag',
  'Transportation': 'directions_car',
  'Bills & Utilities': 'receipt',
  'Entertainment': 'movie',
  'Health': 'favorite',
  'Salary': 'payments',
  'Income': 'payments',
  'Expense': 'shopping_cart',
  'Transfer': 'swap_horiz',
  'Deposit': 'account_balance',
  'Education': 'school',
  'Housing': 'home',
  'Investments': 'trending_up',
  'Personal Care': 'spa',
  'Gifts': 'card_giftcard',
  'Travel': 'flight',
  'Others': 'more_horiz'
};

// Category colors mapping
export const categoryColors: Record<string, string> = {
  'Food & Drinks': '#ff9800',
  'Shopping': '#2196f3',
  'Transportation': '#3f51b5',
  'Bills & Utilities': '#f44336',
  'Entertainment': '#9c27b0',
  'Health': '#4caf50',
  'Salary': '#4caf50',
  'Income': '#4caf50',
  'Expense': '#f44336',
  'Transfer': '#3f51b5',
  'Deposit': '#4caf50',
  'Education': '#009688',
  'Housing': '#795548',
  'Investments': '#009688',
  'Personal Care': '#e91e63',
  'Gifts': '#e91e63',
  'Travel': '#03a9f4',
  'Others': '#607d8b'
};

// Get icon for category
export function getCategoryIcon(categoryName: string): string {
  return categoryIcons[categoryName] || 'more_horiz';
}

// Get color for category
export function getCategoryColor(categoryName: string): string {
  return categoryColors[categoryName] || '#607d8b';
}
