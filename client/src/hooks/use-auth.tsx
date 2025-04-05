import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export type User = {
  id: number;
  username: string;
  isPremium: boolean;
  stripeCustomerId?: string | null;
  trialExpiresAt?: string | null;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (user: User) => void;
  logout: () => void;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);

  // Initial load of user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData: User = JSON.parse(savedUser);
        setUser(userData);
        console.log("Loaded user from localStorage:", userData);
        
        // Validate with server
        fetch(`/api/auth/validate?userId=${userData.id}`)
          .then(res => {
            if (!res.ok) {
              console.log("Server validation failed, clearing user data");
              localStorage.removeItem('user');
              setUser(null);
              return null;
            }
            return res.json();
          })
          .then(serverUser => {
            if (serverUser) {
              console.log("Server validation successful, updated user data:", serverUser);
              setUser(serverUser);
              localStorage.setItem('user', JSON.stringify(serverUser));
            }
          })
          .catch(err => {
            console.error("Auth validation error:", err);
            localStorage.removeItem('user');
            setUser(null);
          });
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Login function to update state and localStorage
  const login = useCallback((userData: User) => {
    console.log("Login function called with:", userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log("User state after login:", userData);
  }, []);

  // Logout function to clear state and localStorage
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = "/";
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      login(userData);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", credentials);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      login(userData);
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
        error: null,
        login,
        logout,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // Add a helper function to check if user is effectively premium (paid or trial)
  const isEffectivelyPremium = () => {
    if (!context.user) return false;
    
    // Check if user is a paid premium user
    if (context.user.isPremium) return true;
    
    // Check if user has an active trial
    if (context.user.trialExpiresAt) {
      const trialExpiry = new Date(context.user.trialExpiresAt);
      return trialExpiry > new Date();
    }
    
    return false;
  };
  
  return {
    ...context,
    isEffectivelyPremium,
  };
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
    }
  }, [user, navigate]);

  return user ? <>{children}</> : null;
}