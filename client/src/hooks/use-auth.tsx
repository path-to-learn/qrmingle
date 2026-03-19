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

  // Query current authenticated user with TanStack Query
  const { 
    data: userData, 
    isLoading: isUserLoading, 
    error: userError 
  } = useQuery({
    queryKey: ['/api/auth/validate'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: true,
  });

  // Update user state when query data changes
  useEffect(() => {
    if (userData) {
      setUser(userData as User);
      console.log("Auth context: User authenticated via session:", userData);
    } else if (userData === null && !isUserLoading) {
      setUser(null);
      console.log("Auth context: No user session found");
    }
  }, [userData, isUserLoading]);

  // Login function to update state when session is established
  const login = useCallback((userData: User) => {
    console.log("Login function called with:", userData);
    setUser(userData);
    console.log("User state after login:", userData);
  }, []);

  // Logout function to clear state when session ends
  const logout = useCallback(() => {
    setUser(null);
    queryClient.setQueryData(['/api/auth/validate'], null);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/validate'] });
    setLocation("/");
  }, [setLocation]);

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
        isLoading: isUserLoading,
        error: userError || null,
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
  
  // All users effectively have premium features now
  const isEffectivelyPremium = () => {
    return !!context.user; // Return true for any logged-in user
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