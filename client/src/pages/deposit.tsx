import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useNavigate } from "@/hooks/use-navigate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, CreditCard, Check } from "lucide-react";
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx"
);

// Form validation schema
const depositSchema = z.object({
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be positive" })
    .min(5, { message: "Minimum deposit amount is $5" })
    .max(10000, { message: "Maximum deposit amount is $10,000" }),
});

type DepositFormValues = z.infer<typeof depositSchema>;

// The actual stripe payment form (inner component)
function CheckoutForm({ 
  amount, 
  onSuccess, 
  clientSecret 
}: { 
  amount: number; 
  onSuccess: () => void;
  clientSecret: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/wallet",
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      // The payment was successful
      try {
        // Get the payment intent ID from the payment result
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          clientSecret || ""
        );
        
        if (!paymentIntent || !paymentIntent.id) {
          throw new Error("Couldn't retrieve payment information");
        }
        
        await apiRequest("POST", "/api/deposit", { 
          amount,
          paymentIntentId: paymentIntent.id
        });
        
        toast({
          title: "Deposit Successful",
          description: `$${amount.toFixed(2)} has been added to your wallet.`,
        });
        
        onSuccess();
      } catch (err: any) {
        toast({
          title: "Error Updating Wallet",
          description: "Your payment was processed but we couldn't update your wallet balance.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className="mb-6" />
      <Button
        className="w-full bg-primary"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

// Deposit page with step handling
export default function Deposit() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(0);
  const [clientSecret, setClientSecret] = useState("");
  const [location] = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Handle form submission (step 1)
  async function onSubmit(values: DepositFormValues) {
    try {
      setAmount(values.amount);
      
      // Create payment intent
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: values.amount,
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setStep(2);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    }
  }

  // Handle payment success
  const handlePaymentSuccess = () => {
    setStep(3);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100 pb-6">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={() => navigate("/wallet")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Deposit to Wallet</h1>
      </header>

      <div className="max-w-md mx-auto mt-6 px-4">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? "bg-primary text-white" : "bg-neutral-200 text-neutral-500"
              }`}
            >
              {step > 1 ? <Check className="h-5 w-5" /> : "1"}
            </div>
            <div className={`h-1 w-10 ${step > 1 ? "bg-primary" : "bg-neutral-200"}`} />
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? "bg-primary text-white" : "bg-neutral-200 text-neutral-500"
              }`}
            >
              {step > 2 ? <Check className="h-5 w-5" /> : "2"}
            </div>
            <div className={`h-1 w-10 ${step > 2 ? "bg-primary" : "bg-neutral-200"}`} />
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? "bg-primary text-white" : "bg-neutral-200 text-neutral-500"
            }`}
          >
            {step > 3 ? <Check className="h-5 w-5" /> : "3"}
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-center">Enter Deposit Amount</h2>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                            <Input
                              {...field}
                              placeholder="0.00"
                              className="pl-10 text-lg py-6"
                              type="number"
                              step="0.01"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/wallet")}
                      className="flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex items-center">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-center">Payment Details</h2>
              <p className="text-center text-neutral-500">
                Amount: <span className="font-medium">${amount.toFixed(2)}</span>
              </p>
            </CardHeader>
            <CardContent>
              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#3f51b5",
                      },
                    },
                  }}
                >
                  <CheckoutForm 
                    amount={amount}
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess} 
                  />
                </Elements>
              ) : (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="text-center">
            <CardContent className="pt-6 pb-6">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Check className="h-8 w-8" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Deposit Successful!</h2>
              <p className="text-neutral-600 mb-6">
                ${amount.toFixed(2)} has been added to your wallet.
              </p>
              <Button onClick={() => navigate("/wallet")} className="bg-primary">
                View Wallet
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods Info */}
        {step === 1 && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Accepted Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Credit/Debit Cards</p>
                    <p className="text-xs text-neutral-500">Visa, Mastercard, Amex</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
