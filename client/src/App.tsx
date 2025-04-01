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
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { AuthProvider, RequireAuth } from "@/hooks/use-auth";

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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
