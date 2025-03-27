import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProfilePage from "@/pages/profile-page";
import Premium from "@/pages/premium";
import Analytics from "@/pages/analytics";
import { useState, createContext, useContext } from "react";
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
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = () => {
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
