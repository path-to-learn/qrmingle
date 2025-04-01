import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProfilePage from "@/pages/profile-page";
import Premium from "@/pages/premium";
import Analytics from "@/pages/analytics";
import Login from "@/pages/login";
import Register from "@/pages/register";
import { useState, createContext, useContext, useEffect } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Define user type
export type User = {
  id: number;
  username: string;
  isPremium: boolean;
  stripeCustomerId?: string | null;
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

// Create auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

// Auth context hook
export const useAuth = () => useContext(AuthContext);

// Protected route component
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return user ? <>{children}</> : null;
}

// Router component
function AppRouter() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/p/:slug" component={ProfilePage} />
          <Route path="/premium">
            <RequireAuth>
              <Premium />
            </RequireAuth>
          </Route>
          <Route path="/analytics">
            <RequireAuth>
              <Analytics />
            </RequireAuth>
          </Route>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

// Main App component
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on initial mount only
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        // Get user from localStorage
        const savedUser = localStorage.getItem('user');
        
        if (!savedUser) {
          console.log("No saved user found in localStorage");
          setIsLoading(false);
          return;
        }
        
        console.log("Found saved user in localStorage:", savedUser);
        
        // Parse user data
        const userData = JSON.parse(savedUser);
        
        // Set user state immediately for better UX
        setUser(userData);
        
        console.log("User state set from localStorage:", userData);
        
        // Validate with server
        console.log("Validating user with server, userId:", userData.id);
        const response = await fetch(`/api/auth/validate?userId=${userData.id}`);
        
        if (response.ok) {
          // Get latest user data from server
          const serverUser = await response.json();
          console.log("Server validation successful, updated user data:", serverUser);
          
          // Update state and localStorage with latest data from server
          setUser(serverUser);
          localStorage.setItem('user', JSON.stringify(serverUser));
        } else {
          // Invalid session, clear localStorage
          console.log("Server validation failed, clearing user data");
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Run immediately on mount
    loadUser();
  }, []);

  // Login function
  const login = (userData: User) => {
    console.log("Login function called with:", userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log("User state after login:", userData);
  };

  // Logout function
  const logout = () => {
    // Clear user from state
    setUser(null);
    
    // Remove from localStorage
    localStorage.removeItem('user');
    
    // Hard refresh to reset all app state
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, login, logout }}>
        <AppRouter />
        <Toaster />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
