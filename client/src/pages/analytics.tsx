import { useEffect } from "react";
import { useNavigate } from "@/hooks/use-navigate";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BottomNavigation } from "@/components/bottom-navigation";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactions } from "@/hooks/use-transactions";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Analytics() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [period, setPeriod] = useState("month");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wallet } = useWallet();
  const { transactions, categories } = useTransactions();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  if (!user) {
    return null; // Or loading state
  }
  
  // Process transaction data for charts
  const expensesByCategory: Record<string, number> = {};
  const monthlyData: Record<string, { income: number; expense: number }> = {
    Jan: { income: 0, expense: 0 },
    Feb: { income: 0, expense: 0 },
    Mar: { income: 0, expense: 0 },
    Apr: { income: 0, expense: 0 },
    May: { income: 0, expense: 0 },
    Jun: { income: 0, expense: 0 },
    Jul: { income: 0, expense: 0 },
    Aug: { income: 0, expense: 0 },
    Sep: { income: 0, expense: 0 },
    Oct: { income: 0, expense: 0 },
    Nov: { income: 0, expense: 0 },
    Dec: { income: 0, expense: 0 },
  };
  
  // Prepare data for charts
  transactions?.forEach(tx => {
    // For pie chart
    if (tx.type === 'expense' && tx.category) {
      const categoryName = tx.category.name;
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = 0;
      }
      expensesByCategory[categoryName] += tx.amount;
    }
    
    // For bar chart
    const month = new Date(tx.date).toLocaleString('en-US', { month: 'short' });
    if (monthlyData[month]) {
      if (tx.type === 'income' || tx.type === 'deposit') {
        monthlyData[month].income += tx.amount;
      } else if (tx.type === 'expense') {
        monthlyData[month].expense += tx.amount;
      }
    }
  });
  
  // Format data for pie chart
  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Format data for bar chart
  const barData = Object.entries(monthlyData).map(([month, data]) => ({
    name: month,
    income: data.income,
    expense: data.expense,
  }));
  
  // Colors for pie chart
  const COLORS = ['#3f51b5', '#f44336', '#4caf50', '#ff9800', '#9c27b0', '#2196f3', '#795548'];
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Analytics</h1>
          <Select defaultValue={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto pb-20">
        {/* Expense Distribution */}
        <div className="p-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-medium text-lg mb-4">Expense Distribution</h2>
              
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Income vs Expenses */}
        <div className="p-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-medium text-lg mb-4">Income vs Expenses</h2>
              
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#4caf50" />
                    <Bar dataKey="expense" name="Expense" fill="#f44336" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Monthly Summary */}
        <div className="p-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-medium text-lg mb-4">Monthly Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Income</span>
                  <span className="font-medium text-success">
                    ${barData.reduce((sum, item) => sum + item.income, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Expenses</span>
                  <span className="font-medium text-danger">
                    ${barData.reduce((sum, item) => sum + item.expense, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Net Balance</span>
                  <span className="font-medium">
                    ${(
                      barData.reduce((sum, item) => sum + item.income, 0) - 
                      barData.reduce((sum, item) => sum + item.expense, 0)
                    ).toFixed(2)}
                  </span>
                </div>
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
