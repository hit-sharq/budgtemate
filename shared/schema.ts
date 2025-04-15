import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  balance: doublePrecision("balance").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  walletId: integer("wallet_id").notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  categoryId: integer("category_id").references(() => categories.id),
  type: text("type").notNull(), // 'income', 'expense', 'transfer', 'deposit'
  amount: doublePrecision("amount").notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer("category_id").references(() => categories.id),
  amount: doublePrecision("amount").notNull(),
  period: text("period").notNull().default("monthly"), // 'monthly', 'weekly', 'yearly'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  stripeCustomerId: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  userId: true,
  walletId: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export const depositSchema = z.object({
  amount: z.number().positive({ message: "Amount must be positive" }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Deposit = z.infer<typeof depositSchema>;

export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Budget = typeof budgets.$inferSelect;

export type TransactionWithCategory = Transaction & {
  category?: Category;
};
