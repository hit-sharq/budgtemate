import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Transaction, Category, InsertTransaction } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useTransactions() {
  const { toast } = useToast();

  // Get all transactions
  const { 
    data: transactions, 
    isLoading, 
    error 
  } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions']
  });

  // Get all categories
  const { 
    data: categories 
  } = useQuery<Category[]>({
    queryKey: ['/api/categories']
  });

  // Add a new transaction
  const addTransaction = useMutation({
    mutationFn: async (transaction: InsertTransaction) => {
      const response = await apiRequest("POST", "/api/transactions", transaction);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate transactions and wallet queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      
      toast({
        title: "Transaction Added",
        description: "Your transaction has been successfully recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Transaction",
        description: error.message || "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Calculate total income and expenses
  const totals = transactions?.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income' || transaction.type === 'deposit') {
        acc.income += transaction.amount;
      } else if (transaction.type === 'expense') {
        acc.expenses += transaction.amount;
      }
      return acc;
    }, 
    { income: 0, expenses: 0 }
  ) || { income: 0, expenses: 0 };

  // Group transactions by date
  const groupedByDate = transactions?.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>) || {};

  return {
    transactions,
    categories,
    isLoading,
    error,
    addTransaction,
    isPending: addTransaction.isPending,
    totals,
    groupedByDate
  };
}
