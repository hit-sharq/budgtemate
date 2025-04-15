import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CategoryBudget } from "@/types";

interface BudgetProgressProps {
  totalBudget: number;
  spentAmount: number;
  categories: CategoryBudget[];
}

export function BudgetProgress({ totalBudget, spentAmount, categories }: BudgetProgressProps) {
  const progressPercentage = Math.min(Math.round((spentAmount / totalBudget) * 100), 100);
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-medium text-neutral-700">Budget Progress</h3>
            <p className="text-xs text-neutral-500">
              ${spentAmount.toFixed(2)} of ${totalBudget.toFixed(2)} spent
            </p>
          </div>
          <span className="text-lg font-semibold text-primary">{progressPercentage}%</span>
        </div>
        
        <Progress value={progressPercentage} className="h-2 mb-4" />
        
        <div className="grid grid-cols-3 gap-2 text-center">
          {categories.map((category) => (
            <div key={category.id} className="bg-neutral-100 rounded-lg p-2">
              <span className="text-xs text-neutral-500 block">{category.name}</span>
              <span className="text-sm font-medium text-neutral-700">
                ${category.spent.toFixed(0)}
              </span>
              <div className="mt-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${Math.min(Math.round((category.spent / category.budget) * 100), 100)}%`,
                    backgroundColor: category.color 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
