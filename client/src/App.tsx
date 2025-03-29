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
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Check localStorage on every render to help debug authentication issues
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && !user) {
      console.log("Found user in localStorage, but not in state", { savedUser });
      setUser(JSON.parse(savedUser));
    } else if (!savedUser && user) {
      console.log("Found user in state, but not in localStorage", { user });
    } else {
      console.log("Auth state check", { user, savedUser: savedUser ? "exists" : "null" });
    }
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
