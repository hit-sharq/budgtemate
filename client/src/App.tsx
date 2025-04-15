import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useEffect, useState } from "react";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Wallet from "./pages/wallet";
import Analytics from "./pages/analytics";
import Profile from "./pages/profile";
import Deposit from "./pages/deposit";
import MpesaDeposit from "./pages/mpesa-deposit";
import NotFound from "./pages/not-found";
import { AuthProvider } from "./hooks/use-auth";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Add Material Icons
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    
    // Add Inter font
    const fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
    
    // Update document title
    document.title = "BudgetWise - Smart Budget & Wallet App";
    
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/profile" component={Profile} />
          <Route path="/deposit" component={Deposit} />
          <Route path="/mpesa-deposit" component={MpesaDeposit} />
          <Route component={NotFound} />
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
