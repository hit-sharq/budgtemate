import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "@/hooks/use-navigate";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Smartphone } from "lucide-react";

// Form validation schema
const mpesaFormSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(13, { message: "Phone number must be at most 13 digits" }),
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  description: z.string().optional(),
});

type MpesaFormValues = z.infer<typeof mpesaFormSchema>;

export default function MpesaDeposit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { wallet, refetchWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  // Form
  const form = useForm<MpesaFormValues>({
    resolver: zodResolver(mpesaFormSchema),
    defaultValues: {
      phoneNumber: "",
      amount: "",
      description: "Wallet top-up",
    },
  });

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Not Authorized</CardTitle>
            <CardDescription>Please log in to access this page.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => navigate("/login")}
              className="w-full"
            >
              Log In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  async function onSubmit(values: MpesaFormValues) {
    try {
      setIsLoading(true);
      setTransactionStatus("pending");

      // For development/testing purposes, use the confirm-deposit endpoint
      // In production, use the stk-push endpoint
      const response = await apiRequest("POST", "/api/mpesa/confirm-deposit", {
        phoneNumber: values.phoneNumber,
        amount: parseFloat(values.amount),
        description: values.description || "Wallet top-up",
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        setTransactionStatus("success");
        toast({
          title: "M-Pesa Deposit Successful",
          description: `KES ${values.amount} has been added to your wallet.`,
        });
        
        // Refresh wallet data
        refetchWallet();
        
        // Reset form
        form.reset();
        
        // Navigate back to wallet after a short delay
        setTimeout(() => {
          navigate("/wallet");
        }, 2000);
      } else {
        // API error
        setTransactionStatus("error");
        toast({
          title: "Deposit Failed",
          description: data.message || "Could not process M-Pesa payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("M-Pesa payment error:", error);
      setTransactionStatus("error");
      toast({
        title: "Deposit Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-md py-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate("/wallet")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Wallet
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">M-Pesa Deposit</CardTitle>
              <CardDescription>
                Add funds to your wallet using M-Pesa
              </CardDescription>
            </div>
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 254712345678"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (KES)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-neutral-400">KES</span>
                        </div>
                        <Input
                          placeholder="0.00"
                          type="number"
                          {...field}
                          className="pl-12 text-xl py-6"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Reason for deposit"
                        className="resize-none"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary text-white py-6"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Deposit with M-Pesa"}
              </Button>
            </form>
          </Form>

          {transactionStatus === "pending" && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                Processing your payment...
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Please wait while we confirm your M-Pesa payment
              </p>
            </div>
          )}

          {transactionStatus === "success" && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                Payment Successful!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Your wallet has been updated. Redirecting to wallet page...
              </p>
            </div>
          )}

          {transactionStatus === "error" && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                Payment Failed
              </p>
              <p className="text-xs text-red-700 mt-1">
                There was an error processing your payment. Please try again.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col space-y-2">
          <div className="text-xs text-neutral-500">
            <p>
              M-Pesa is a mobile money transfer service in Kenya. You will
              receive a prompt on your phone to complete the payment.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}