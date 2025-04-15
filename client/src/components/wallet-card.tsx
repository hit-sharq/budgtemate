import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send } from "lucide-react";
import { useNavigate } from "@/hooks/use-navigate";
import { formatCurrency } from "@/lib/utils";
import { Wallet } from "@/types";

interface WalletCardProps {
  wallet: Wallet;
  className?: string;
}

export function WalletCard({ wallet, className = "" }: WalletCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card className={`bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg ${className}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium opacity-90">My Wallet</h2>
          <Button variant="ghost" size="icon" className="bg-white/20 rounded-full h-8 w-8 p-1">
            <span className="material-icons text-sm">more_horiz</span>
          </Button>
        </div>
        <div className="mb-2">
          <span className="text-sm opacity-80">Available Balance</span>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">
              {formatCurrency(wallet.balance, wallet.currency)}
            </span>
            <span className="ml-2 text-sm opacity-70">{wallet.currency}</span>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Button 
            onClick={() => navigate("/deposit")}
            className="bg-white/30 hover:bg-white/40 text-white rounded-lg"
          >
            <Plus className="mr-1 h-4 w-4" />
            Deposit
          </Button>
          <Button 
            className="bg-white/30 hover:bg-white/40 text-white rounded-lg"
          >
            <Send className="mr-1 h-4 w-4" />
            Transfer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
