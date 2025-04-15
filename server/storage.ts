import {
  users, wallets, categories, transactions, budgets,
  type User, type Wallet, type Category, type Transaction, type Budget,
  type InsertUser, type InsertWallet, type InsertCategory, type InsertTransaction, type InsertBudget
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Wallet operations
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletByUserId(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(id: number, amount: number): Promise<Wallet | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Transaction operations
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Budget operations
  getBudgets(userId: number): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  
  // Stripe operations
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  
  private userIdCounter: number;
  private walletIdCounter: number;
  private categoryIdCounter: number;
  private transactionIdCounter: number;
  private budgetIdCounter: number;

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.categories = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    
    this.userIdCounter = 1;
    this.walletIdCounter = 1;
    this.categoryIdCounter = 1;
    this.transactionIdCounter = 1;
    this.budgetIdCounter = 1;
    
    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: 'Food & Drinks', icon: 'restaurant', color: '#ff9800', isDefault: true },
      { name: 'Shopping', icon: 'shopping_bag', color: '#2196f3', isDefault: true },
      { name: 'Transportation', icon: 'directions_car', color: '#3f51b5', isDefault: true },
      { name: 'Bills & Utilities', icon: 'receipt', color: '#f44336', isDefault: true },
      { name: 'Entertainment', icon: 'movie', color: '#9c27b0', isDefault: true },
      { name: 'Health', icon: 'favorite', color: '#4caf50', isDefault: true },
      { name: 'Salary', icon: 'payments', color: '#4caf50', isDefault: true },
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now, stripeCustomerId: null };
    this.users.set(id, user);
    
    // Create a wallet for the new user
    await this.createWallet({
      userId: id,
      balance: 0,
      currency: "USD",
    });
    
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Wallet operations
  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }
  
  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.userId === userId,
    );
  }
  
  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.walletIdCounter++;
    const now = new Date();
    const wallet: Wallet = { ...insertWallet, id, createdAt: now };
    this.wallets.set(id, wallet);
    return wallet;
  }
  
  async updateWalletBalance(id: number, amount: number): Promise<Wallet | undefined> {
    const wallet = await this.getWallet(id);
    if (!wallet) return undefined;
    
    const updatedWallet = { 
      ...wallet,
      balance: wallet.balance + amount
    };
    
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const now = new Date();
    const category: Category = { ...insertCategory, id, createdAt: now };
    this.categories.set(id, category);
    return category;
  }

  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: now,
      date: insertTransaction.date || now
    };
    
    this.transactions.set(id, transaction);
    
    // Update wallet balance based on transaction type
    const wallet = await this.getWallet(transaction.walletId);
    if (wallet) {
      let balanceChange = 0;
      
      if (transaction.type === 'income') {
        balanceChange = transaction.amount;
      } else if (transaction.type === 'expense') {
        balanceChange = -transaction.amount;
      } else if (transaction.type === 'deposit') {
        balanceChange = transaction.amount;
      }
      
      if (balanceChange !== 0) {
        await this.updateWalletBalance(wallet.id, balanceChange);
      }
    }
    
    return transaction;
  }

  // Budget operations
  async getBudgets(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values())
      .filter(budget => budget.userId === userId);
  }
  
  async getBudget(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }
  
  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.budgetIdCounter++;
    const now = new Date();
    const budget: Budget = { ...insertBudget, id, createdAt: now };
    this.budgets.set(id, budget);
    return budget;
  }
  
  // Stripe operations
  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, stripeCustomerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();
