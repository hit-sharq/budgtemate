// User types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  stripeCustomerId?: string;
  createdAt?: Date;
}

// Wallet types
export interface Wallet {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  createdAt?: Date;
}

// Category types
export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt?: Date;
}

// Transaction types
export interface Transaction {
  id: number;
  userId: number;
  walletId: number;
  categoryId?: number;
  type: 'income' | 'expense' | 'transfer' | 'deposit';
  amount: number;
  description?: string;
  date: Date;
  createdAt?: Date;
  category?: Category;
}

export interface InsertTransaction {
  type: 'income' | 'expense' | 'transfer' | 'deposit';
  amount: number;
  categoryId?: number;
  description?: string;
  date: Date | string;  // Can be either Date object or ISO string
}

// Budget types
export interface Budget {
  id: number;
  userId: number;
  categoryId?: number;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  createdAt?: Date;
  category?: Category;
}

export interface InsertBudget {
  categoryId?: number;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
  endDate?: Date;
}

// Chart data types
export interface ChartData {
  name: string;
  amount: number;
}

// Category budget for display
export interface CategoryBudget {
  id: number;
  name: string;
  budget: number;
  spent: number;
  color: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Deposit types
export interface DepositRequest {
  amount: number;
  paymentIntentId: string;
}
