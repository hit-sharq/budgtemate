import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category, Wallet } from "@/types";
import { useTransactions } from "@/hooks/use-transactions";

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  wallet: Wallet;
}

const formSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  categoryId: z.coerce.number().optional(),
  description: z.string().optional(),
  date: z.date().default(() => new Date()),
});

type FormValues = z.infer<typeof formSchema>;

export function AddTransactionModal({ open, onOpenChange, categories, wallet }: AddTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const { addTransaction, isPending } = useTransactions();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      categoryId: undefined,
      description: "",
      date: new Date(),
    },
  });
  
  function onSubmit(values: FormValues) {
    // Format the date as ISO string to ensure proper serialization
    const formattedData = {
      ...values,
      type: transactionType,
      date: values.date.toISOString()
    };
    
    addTransaction.mutate(
      formattedData,
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  }
  
  // Filter categories based on transaction type
  const filteredCategories = categories.filter(cat => {
    if (transactionType === "income") {
      return cat.name === "Salary" || cat.name.includes("Income");
    }
    return cat.name !== "Salary" && !cat.name.includes("Income");
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add Transaction</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Transaction Type Selector */}
            <div className="flex rounded-lg overflow-hidden border border-neutral-100">
              <Button
                type="button"
                className={`flex-1 rounded-none ${
                  transactionType === "expense" 
                    ? "bg-primary text-white" 
                    : "bg-white text-neutral-500"
                }`}
                onClick={() => {
                  setTransactionType("expense");
                  form.setValue("type", "expense");
                }}
              >
                Expense
              </Button>
              <Button
                type="button"
                className={`flex-1 rounded-none ${
                  transactionType === "income" 
                    ? "bg-primary text-white" 
                    : "bg-white text-neutral-500"
                }`}
                onClick={() => {
                  setTransactionType("income");
                  form.setValue("type", "income");
                }}
              >
                Income
              </Button>
            </div>
            
            {/* Amount Field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-neutral-400">$</span>
                      </div>
                      <Input 
                        placeholder="0.00" 
                        {...field} 
                        className="pl-8 text-xl py-6" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Category Selector */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="py-6">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Date Picker */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePicker 
                      date={field.value} 
                      setDate={field.onChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add notes here..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Wallet Selection */}
            <div className="p-3 bg-neutral-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-icons text-primary mr-2">account_balance_wallet</span>
                  <div>
                    <h4 className="font-medium text-neutral-700">My Wallet</h4>
                    <p className="text-xs text-neutral-500">
                      Balance: ${wallet.balance.toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="material-icons text-neutral-500">check_circle</span>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark text-white py-6"
              disabled={isPending}
            >
              {isPending ? "Adding..." : "Add Transaction"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
