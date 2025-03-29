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

  // Load user on initial mount only
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get user from localStorage
        const savedUser = localStorage.getItem('user');
        if (!savedUser) return;
        
        // Parse user data
        const userData = JSON.parse(savedUser);
        
        // Set user state
        setUser(userData);
        
        // Validate with server
        const response = await fetch(`/api/auth/validate?userId=${userData.id}`);
        
        if (response.ok) {
          // Get latest user data from server
          const serverUser = await response.json();
          setUser(serverUser);
          localStorage.setItem('user', JSON.stringify(serverUser));
        } else {
          // Invalid session, clear localStorage
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem('user');
        setUser(null);
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

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
