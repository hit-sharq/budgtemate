import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";

interface TransactionItemProps {
  transaction: Transaction;
  showFullDate?: boolean;
}

export function TransactionItem({ transaction, showFullDate = false }: TransactionItemProps) {
  // Determine if it's an expense or income
  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';
  const isDeposit = transaction.type === 'deposit';
  
  // Determine amount display
  const amountPrefix = isExpense ? '−' : isIncome || isDeposit ? '+' : '';
  const amountClass = isExpense ? 'text-danger' : isIncome || isDeposit ? 'text-success' : '';
  
  // Date formatting
  const formattedDate = showFullDate 
    ? formatDate(transaction.date) 
    : transaction.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Default category values if none provided
  const categoryName = transaction.category?.name || (
    isIncome ? 'Income' : 
    isDeposit ? 'Deposit' : 
    isExpense ? 'Expense' : 'Transfer'
  );
  
  const categoryIcon = transaction.category?.icon || (
    isIncome ? 'payments' : 
    isDeposit ? 'account_balance' : 
    isExpense ? 'shopping_cart' : 'swap_horiz'
  );
  
  const categoryColor = transaction.category?.color || (
    isIncome || isDeposit ? '#4caf50' : 
    isExpense ? '#f44336' : '#3f51b5'
  );
  
  return (
    <div className="flex items-center pb-3 border-b border-neutral-100 last:border-b-0">
      <CategoryIcon 
        icon={categoryIcon} 
        color={categoryColor} 
        className="mr-3" 
      />
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-neutral-700">{categoryName}</h4>
          <span className={`font-semibold ${amountClass}`}>
            {amountPrefix}{formatCurrency(transaction.amount)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-400">{transaction.description || categoryName}</span>
          <span className="text-xs text-neutral-400">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
