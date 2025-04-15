import { useState, useEffect } from "react";
import { useNavigate } from "@/hooks/use-navigate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WalletCard } from "@/components/wallet-card";
import { BudgetProgress } from "@/components/budget-progress";
import { SpendingChart } from "@/components/spending-chart";
import { TransactionItem } from "@/components/transaction-item";
import { BottomNavigation } from "@/components/bottom-navigation";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactions } from "@/hooks/use-transactions";
import { CategoryBudget, ChartData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wallet, isLoading: isWalletLoading } = useWallet();
  const { 
    transactions, 
    categories, 
    isLoading: isTransactionsLoading 
  } = useTransactions();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Mock data for charts - in a real app, this would come from the backend
  const chartData = {
    weekly: [
      { name: 'Mon', amount: 120 },
      { name: 'Tue', amount: 180 },
      { name: 'Wed', amount: 90 },
      { name: 'Thu', amount: 240 },
      { name: 'Fri', amount: 150 },
      { name: 'Sat', amount: 195 },
      { name: 'Sun', amount: 75 },
    ],
    monthly: [
      { name: 'Week 1', amount: 685 },
      { name: 'Week 2', amount: 890 },
      { name: 'Week 3', amount: 720 },
      { name: 'Week 4', amount: 950 },
    ],
    yearly: [
      { name: 'Jan', amount: 2450 },
      { name: 'Feb', amount: 2100 },
      { name: 'Mar', amount: 2800 },
      { name: 'Apr', amount: 1950 },
      { name: 'May', amount: 2300 },
      { name: 'Jun', amount: 2750 },
    ],
  };
  
  // Mock budget data - in a real app, this would come from the backend
  const budgetData = {
    totalBudget: 2000,
    spentAmount: 1240,
    categories: [
      { id: 1, name: 'Food', budget: 600, spent: 420, color: '#ff9800' },
      { id: 2, name: 'Transport', budget: 500, spent: 350, color: '#2196f3' },
      { id: 3, name: 'Utilities', budget: 400, spent: 270, color: '#4caf50' },
    ],
  };
  
  if (!user) {
    return null; // Or loading state
  }
  
  // Get recent transactions (limit to 4)
  const recentTransactions = transactions?.slice(0, 4) || [];
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">BudgetWise</h1>
            <p className="text-xs text-white/70">
              Welcome back, {user.firstName || user.username}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-white/10">
            <Bell className="h-5 w-5 text-white" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto pb-20">
        {/* Wallet Card */}
        <div className="p-4">
          {isWalletLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : wallet ? (
            <WalletCard wallet={wallet} />
          ) : (
            <div className="text-center p-4">
              <p>No wallet found</p>
            </div>
          )}
        </div>

        {/* Monthly Overview */}
        <div className="px-4 mb-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-neutral-700">Monthly Overview</h2>
            <Button variant="ghost" className="text-primary text-sm h-auto p-0">
              October
              <span className="material-icons text-sm ml-1">expand_more</span>
            </Button>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="px-4 mb-6">
          <BudgetProgress 
            totalBudget={budgetData.totalBudget}
            spentAmount={budgetData.spentAmount}
            categories={budgetData.categories as CategoryBudget[]}
          />
        </div>

        {/* Spending Analytics */}
        <div className="px-4 mb-6">
          <SpendingChart data={chartData as { weekly: ChartData[], monthly: ChartData[], yearly: ChartData[] }} />
        </div>

        {/* Recent Transactions */}
        <div className="px-4 mb-20">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-neutral-700">Recent Transactions</h3>
                <Button variant="link" className="text-primary p-0 h-auto">See All</Button>
              </div>
              
              <div className="transaction-list space-y-3 max-h-[300px] overflow-y-auto">
                {isTransactionsLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 pb-3 border-b border-neutral-100">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-grow">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <TransactionItem 
                      key={transaction.id} 
                      transaction={transaction} 
                    />
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-neutral-500">No transactions yet</p>
                    <Button 
                      variant="link" 
                      className="text-primary mt-2"
                      onClick={() => setIsAddTransactionOpen(true)}
                    >
                      Add your first transaction
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation onAddClick={() => setIsAddTransactionOpen(true)} />
      
      {/* Add Transaction Modal */}
      {wallet && (
        <AddTransactionModal 
          open={isAddTransactionOpen}
          onOpenChange={setIsAddTransactionOpen}
          categories={categories || []}
          wallet={wallet}
        />
      )}
    </div>
  );
}
