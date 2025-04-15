import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Wallet, DepositRequest } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useWallet() {
  const { toast } = useToast();

  // Get wallet information
  const { 
    data: wallet, 
    isLoading, 
    error 
  } = useQuery<Wallet>({
    queryKey: ['/api/wallet']
  });

  // Deposit money to wallet
  const deposit = useMutation({
    mutationFn: async (data: DepositRequest) => {
      const response = await apiRequest("POST", "/api/deposit", data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate wallet and transactions queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      toast({
        title: "Deposit Successful",
        description: "Your funds have been added to your wallet.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create payment intent for Stripe
  const createPaymentIntent = async (amount: number) => {
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", { amount });
      return await response.json();
    } catch (error: any) {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Failed to set up payment. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    wallet,
    isLoading,
    error,
    deposit,
    createPaymentIntent
  };
}
