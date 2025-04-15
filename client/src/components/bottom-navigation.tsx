import { Home, BarChart3, Plus, Wallet, User } from "lucide-react";
import { useLocation } from "wouter";
import { useNavigate } from "@/hooks/use-navigate";

interface BottomNavigationProps {
  onAddClick: () => void;
}

export function BottomNavigation({ onAddClick }: BottomNavigationProps) {
  const [location] = useLocation();
  const navigate = useNavigate();
  
  return (
    <nav className="bg-white border-t fixed bottom-0 w-full z-10">
      <div className="flex justify-around">
        <button 
          className={`flex flex-col items-center py-2 px-4 ${
            location === '/dashboard' ? 'text-primary' : 'text-neutral-400'
          }`}
          onClick={() => navigate('/dashboard')}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button 
          className={`flex flex-col items-center py-2 px-4 ${
            location === '/analytics' ? 'text-primary' : 'text-neutral-400'
          }`}
          onClick={() => navigate('/analytics')}
        >
          <BarChart3 size={24} />
          <span className="text-xs mt-1">Analytics</span>
        </button>
        
        <button 
          className="relative -top-4 flex flex-col items-center justify-center rounded-full w-14 h-14 bg-primary text-white shadow-lg"
          onClick={onAddClick}
        >
          <Plus size={24} />
        </button>
        
        <button 
          className={`flex flex-col items-center py-2 px-4 ${
            location === '/wallet' ? 'text-primary' : 'text-neutral-400'
          }`}
          onClick={() => navigate('/wallet')}
        >
          <Wallet size={24} />
          <span className="text-xs mt-1">Wallet</span>
        </button>
        
        <button 
          className={`flex flex-col items-center py-2 px-4 ${
            location === '/profile' ? 'text-primary' : 'text-neutral-400'
          }`}
          onClick={() => navigate('/profile')}
        >
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
}
