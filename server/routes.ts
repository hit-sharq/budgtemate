import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginUserSchema, 
  insertTransactionSchema, 
  insertBudgetSchema, 
  depositSchema,
  mpesaPaymentSchema
} from "@shared/schema";
import { initiateSTKPush, checkTransactionStatus, validateMpesaCallback } from "./services/mpesa";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Helper to validate request body with Zod schema
function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(400).json({ message: "Invalid request data" });
    }
  };
}

// Stripe setup
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY. Stripe deposit functionality will not work.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" }) 
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "budgetwise-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      cookie: { 
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    })
  );
  
  // Authentication middleware
  const authenticate = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/register", validateRequest(insertUserSchema), async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });
      
      // Set session
      req.session.userId = user.id;
      
      return res.status(201).json({ 
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.post("/api/login", validateRequest(loginUserSchema), async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      return res.status(200).json({ 
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Error during login" });
    }
  });
  
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/me", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Error fetching user data" });
    }
  });
  
  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      return res.status(500).json({ message: "Error fetching categories" });
    }
  });
  
  // Wallet routes
  app.get("/api/wallet", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const wallet = await storage.getWalletByUserId(userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      return res.status(200).json(wallet);
    } catch (error) {
      console.error("Get wallet error:", error);
      return res.status(500).json({ message: "Error fetching wallet" });
    }
  });
  
  // Transaction routes
  app.get("/api/transactions", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const transactions = await storage.getTransactions(userId);
      
      // Fetch category for each transaction
      const transactionsWithCategory = await Promise.all(
        transactions.map(async (transaction) => {
          if (transaction.categoryId) {
            const category = await storage.getCategory(transaction.categoryId);
            return { ...transaction, category };
          }
          return transaction;
        })
      );
      
      return res.status(200).json(transactionsWithCategory);
    } catch (error) {
      console.error("Get transactions error:", error);
      return res.status(500).json({ message: "Error fetching transactions" });
    }
  });
  
  app.post("/api/transactions", authenticate, validateRequest(insertTransactionSchema), async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const wallet = await storage.getWalletByUserId(userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      const transaction = await storage.createTransaction({
        ...req.body,
        userId,
        walletId: wallet.id,
      });
      
      // Fetch updated wallet after transaction
      const updatedWallet = await storage.getWalletByUserId(userId);
      
      return res.status(201).json({ transaction, wallet: updatedWallet });
    } catch (error) {
      console.error("Create transaction error:", error);
      return res.status(500).json({ message: "Error creating transaction" });
    }
  });
  
  // Budget routes
  app.get("/api/budgets", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const budgets = await storage.getBudgets(userId);
      
      // Fetch category for each budget
      const budgetsWithCategory = await Promise.all(
        budgets.map(async (budget) => {
          if (budget.categoryId) {
            const category = await storage.getCategory(budget.categoryId);
            return { ...budget, category };
          }
          return budget;
        })
      );
      
      return res.status(200).json(budgetsWithCategory);
    } catch (error) {
      console.error("Get budgets error:", error);
      return res.status(500).json({ message: "Error fetching budgets" });
    }
  });
  
  app.post("/api/budgets", authenticate, validateRequest(insertBudgetSchema), async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      const budget = await storage.createBudget({
        ...req.body,
        userId,
      });
      
      return res.status(201).json(budget);
    } catch (error) {
      console.error("Create budget error:", error);
      return res.status(500).json({ message: "Error creating budget" });
    }
  });
  
  // Stripe payment route for wallet deposits
  app.post("/api/create-payment-intent", authenticate, validateRequest(depositSchema), async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe integration not configured" });
      }
      
      const { amount } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });
  
  // Deposit confirmation endpoint
  app.post("/api/deposit", authenticate, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe integration not configured" });
      }
      
      const userId = req.session.userId as number;
      const { amount, paymentIntentId } = req.body;
      
      // Validate the payment was successful
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment confirmation required" });
      }
      
      // Verify the payment intent exists and is successful
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({ 
            message: `Payment not completed. Status: ${paymentIntent.status}` 
          });
        }
      } catch (stripeError) {
        console.error("Stripe validation error:", stripeError);
        return res.status(400).json({ message: "Invalid payment information" });
      }
      
      // Get user wallet
      const wallet = await storage.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Create deposit transaction
      const transaction = await storage.createTransaction({
        userId,
        walletId: wallet.id,
        type: "deposit",
        amount: parseFloat(amount.toString()),
        description: "Wallet deposit via Stripe",
        date: new Date(),
      });
      
      // Get updated wallet
      const updatedWallet = await storage.getWalletByUserId(userId);
      
      return res.status(200).json({ 
        message: "Deposit successful", 
        transaction, 
        wallet: updatedWallet 
      });
    } catch (error) {
      console.error("Deposit error:", error);
      return res.status(500).json({ message: "Error processing deposit" });
    }
  });

  // M-Pesa payment routes
  app.post("/api/mpesa/stk-push", authenticate, validateRequest(mpesaPaymentSchema), async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { phoneNumber, amount, description = "BudgetWise Wallet Top-up" } = req.body;

      // Get callback URL (in production, use your actual domain)
      const callbackUrl = `${process.env.APP_URL || 'https://budgetwise.replit.app'}/api/mpesa/callback`;
      
      // Initiate STK Push
      const result = await initiateSTKPush({
        phoneNumber,
        amount,
        callbackUrl,
        accountReference: "BudgetWise",
        description
      });
      
      // Store the CheckoutRequestID for later validation
      // In a real application, you might want to store this in the database
      
      return res.status(200).json({
        message: "M-Pesa payment initiated",
        checkoutRequestId: result.CheckoutRequestID,
        merchantRequestId: result.MerchantRequestID
      });
    } catch (error: any) {
      console.error("M-Pesa STK Push error:", error);
      return res.status(500).json({ 
        message: "Error initiating M-Pesa payment",
        error: error.message 
      });
    }
  });

  // M-Pesa callback endpoint (called by M-Pesa after payment)
  app.post("/api/mpesa/callback", async (req, res) => {
    try {
      // Validate the callback
      if (!validateMpesaCallback(req.body)) {
        return res.status(400).json({ message: "Invalid callback data" });
      }
      
      // Extract relevant information from callback
      const { Body } = req.body;
      
      // If payment was successful
      if (Body.stkCallback.ResultCode === 0) {
        const callbackMetadata = Body.stkCallback.CallbackMetadata.Item;
        
        // Extract amount and phone number
        const amount = callbackMetadata.find((item: any) => item.Name === "Amount")?.Value || 0;
        const phoneNumber = callbackMetadata.find((item: any) => item.Name === "PhoneNumber")?.Value || "";
        const transactionId = callbackMetadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value || "";
        
        // In a real application, you would:
        // 1. Find the user by phone number
        // 2. Update their wallet balance
        // 3. Create a transaction record
        
        console.log(`M-Pesa payment successful: ${amount} from ${phoneNumber}, receipt: ${transactionId}`);
      } else {
        console.error(`M-Pesa payment failed: ${Body.stkCallback.ResultDesc}`);
      }
      
      // Always respond with success to M-Pesa
      return res.status(200).json({ message: "Callback received" });
    } catch (error) {
      console.error("M-Pesa callback error:", error);
      // Still return success to M-Pesa to prevent retries
      return res.status(200).json({ message: "Callback processed" });
    }
  });

  // M-Pesa query transaction status
  app.get("/api/mpesa/transaction/:checkoutRequestId", authenticate, async (req, res) => {
    try {
      const { checkoutRequestId } = req.params;
      
      const result = await checkTransactionStatus(checkoutRequestId);
      
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("M-Pesa transaction status check error:", error);
      return res.status(500).json({ 
        message: "Error checking transaction status",
        error: error.message 
      });
    }
  });

  // M-Pesa manual deposit confirmation (for demo/testing purposes)
  app.post("/api/mpesa/confirm-deposit", authenticate, validateRequest(mpesaPaymentSchema), async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { amount, phoneNumber, description = "M-Pesa deposit" } = req.body;
      
      // Get user wallet
      const wallet = await storage.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Create deposit transaction
      const transaction = await storage.createTransaction({
        userId,
        walletId: wallet.id,
        type: "deposit",
        amount: parseFloat(amount.toString()),
        description: `${description} via M-Pesa from ${phoneNumber}`,
        date: new Date(),
      });
      
      // Get updated wallet
      const updatedWallet = await storage.getWalletByUserId(userId);
      
      return res.status(200).json({ 
        message: "M-Pesa deposit successful", 
        transaction, 
        wallet: updatedWallet 
      });
    } catch (error) {
      console.error("M-Pesa manual deposit error:", error);
      return res.status(500).json({ message: "Error processing M-Pesa deposit" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
