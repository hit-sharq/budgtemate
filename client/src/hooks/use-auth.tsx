import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      setIsLoading(true);
      const response = await apiRequest("GET", "/api/me");
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      // User is not authenticated, that's ok
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    try {
      const response = await apiRequest("POST", "/api/login", { username, password });
      const userData = await response.json();
      setUser(userData);
    } catch (error: any) {
      const message = error.message || "Failed to log in. Please check your credentials.";
      throw new Error(message);
    }
  }

  async function register(userData: RegisterData) {
    try {
      const response = await apiRequest("POST", "/api/register", userData);
      const user = await response.json();
      setUser(user);
    } catch (error: any) {
      const message = error.message || "Failed to create account. Please try again.";
      throw new Error(message);
    }
  }

  async function logout() {
    try {
      await apiRequest("POST", "/api/logout");
      setUser(null);
    } catch (error: any) {
      const message = error.message || "Failed to log out. Please try again.";
      throw new Error(message);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
