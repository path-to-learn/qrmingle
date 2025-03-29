import { Switch, Route } from "wouter";
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

// Create a basic auth context
type User = {
  id: number;
  username: string;
  isPremium: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/p/:slug" component={ProfilePage} />
          <Route path="/premium" component={Premium} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Load user from localStorage on app start
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing saved user:", error);
      // If there's an error parsing, clear the corrupted data
      localStorage.removeItem('user');
      return null;
    }
  });

  // Verify user auth state on app initialization
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Only perform this check if there's a user in state
        if (user) {
          // Make a request to validate the session with the user's ID
          const response = await fetch(`/api/auth/validate?userId=${user.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          // If the request fails or returns non-200, clear the user state
          if (!response.ok) {
            console.log("Auth validation failed, clearing local user data");
            localStorage.removeItem('user');
            setUser(null);
          } else {
            // Update the user data with the latest from the server
            const updatedUserData = await response.json();
            if (JSON.stringify(updatedUserData) !== JSON.stringify(user)) {
              console.log("Updated user data from server");
              localStorage.setItem('user', JSON.stringify(updatedUserData));
              setUser(updatedUserData);
            }
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };
    
    // Now that we have the validation endpoint, uncomment this
    checkAuthStatus();
  }, [user]);

  // Debug auth state changes
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    console.log("Auth state check", { user, savedUser });
  }, [user]);

  const login = (user: User) => {
    console.log("Login called with user:", user);
    // Save user to localStorage
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    console.log("Logout called");
    // Remove user from localStorage
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, login, logout }}>
        <Router />
        <Toaster />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
