import { useState, useEffect } from "react";
import { useNavigate } from "@/hooks/use-navigate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/bottom-navigation";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import { TransactionItem } from "@/components/transaction-item";
import { MoreVertical } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Wallet() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
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
  
  if (!user) {
    return null; // Or loading state
  }
  
  // Filter transactions by type
  const filteredTransactions = transactions?.filter(tx => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'income') return tx.type === 'income' || tx.type === 'deposit';
    if (activeFilter === 'expense') return tx.type === 'expense';
    return true;
  }) || [];
  
  // Group transactions by date
  const groupedTransactions: Record<string, typeof filteredTransactions> = {};
  
  filteredTransactions.forEach(tx => {
    const date = new Date(tx.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    
    groupedTransactions[date].push(tx);
  });
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">My Wallet</h1>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-white/10">
            <MoreVertical className="h-5 w-5 text-white" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto pb-20">
        {/* Wallet Balance Card */}
        <div className="p-4">
          <Card className="shadow-lg">
            <CardContent className="p-5">
              {isWalletLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-48" />
                  <div className="pt-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ) : wallet ? (
                <>
                  <p className="text-sm text-neutral-500 mb-1">Current Balance</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-neutral-800">
                      {formatCurrency(wallet.balance, wallet.currency)}
                    </span>
                    <span className="ml-2 text-sm text-neutral-500">{wallet.currency}</span>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => navigate("/deposit")}
                      className="bg-primary text-white"
                    >
                      <span className="material-icons mr-2 text-sm">add</span>
                      Deposit
                    </Button>
                    <Button 
                      variant="outline"
                      className="bg-neutral-100 text-neutral-700 border-neutral-200"
                    >
                      <span className="material-icons mr-2 text-sm">payments</span>
                      Transfer
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <p>No wallet found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Transaction History */}
        <div className="px-4 mb-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-neutral-700">Transaction History</h2>
            <div className="flex items-center bg-neutral-100 rounded-lg p-1">
              <Button 
                variant={activeFilter === 'all' ? 'default' : 'ghost'}
                className={`px-3 py-1 h-auto text-xs rounded-md ${
                  activeFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500'
                }`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={activeFilter === 'income' ? 'default' : 'ghost'}
                className={`px-3 py-1 h-auto text-xs rounded-md ${
                  activeFilter === 'income' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500'
                }`}
                onClick={() => setActiveFilter('income')}
              >
                Income
              </Button>
              <Button 
                variant={activeFilter === 'expense' ? 'default' : 'ghost'}
                className={`px-3 py-1 h-auto text-xs rounded-md ${
                  activeFilter === 'expense' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500'
                }`}
                onClick={() => setActiveFilter('expense')}
              >
                Expense
              </Button>
            </div>
          </div>
          
          {/* Transaction List */}
          <Card className="shadow-sm overflow-hidden">
            {isTransactionsLoading ? (
              <div className="p-4 space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-grow">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length > 0 ? (
              Object.entries(groupedTransactions).map(([date, txs]) => (
                <div key={date}>
                  <div className="p-3 bg-neutral-50 border-b border-neutral-100">
                    <span className="text-xs font-medium text-neutral-500">{date}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {txs.map(transaction => (
                      <TransactionItem 
                        key={transaction.id} 
                        transaction={transaction}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-neutral-500 mb-2">No transactions found</p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddTransactionOpen(true)}
                >
                  Add Transaction
                </Button>
              </div>
            )}
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
