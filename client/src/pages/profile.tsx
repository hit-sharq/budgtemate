import { useState, useEffect } from "react";
import { useNavigate } from "@/hooks/use-navigate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  Moon, 
  Shield, 
  User 
} from "lucide-react";

export default function Profile() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Profile</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto pb-20">
        {/* Profile Card */}
        <div className="p-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white mr-4">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{user.firstName || user.username}</h2>
                  <p className="text-neutral-500">{user.email}</p>
                </div>
              </div>
              
              <Button className="w-full" variant="outline">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Settings */}
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-neutral-700 mb-2">Settings</h2>
          
          <Card className="shadow-sm mb-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-neutral-500 mr-3" />
                  <span>Notifications</span>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <Moon className="h-5 w-5 text-neutral-500 mr-3" />
                  <span>Dark Mode</span>
                </div>
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={setIsDarkMode} 
                />
              </div>
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-neutral-500 mr-3" />
                  <span>Payment Methods</span>
                </div>
                <span className="material-icons text-neutral-400">chevron_right</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm mb-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-neutral-500 mr-3" />
                  <span>Security</span>
                </div>
                <span className="material-icons text-neutral-400">chevron_right</span>
              </div>
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 text-neutral-500 mr-3" />
                  <span>Help & Support</span>
                </div>
                <span className="material-icons text-neutral-400">chevron_right</span>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
        
        {/* App Info */}
        <div className="px-4 mb-20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary">BudgetWise</h3>
            <p className="text-xs text-neutral-500">Version 1.0.0</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation onAddClick={() => {}} />
    </div>
  );
}
