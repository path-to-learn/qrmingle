import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProfilePage from "@/pages/profile-page";
import ProfilesDashboard from "@/pages/profiles-dashboard";
import AdminPage from "@/pages/admin";
import Premium from "@/pages/premium";
import PremiumSuccess from "@/pages/premium-success";
import Analytics from "@/pages/analytics";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Help from "@/pages/help";
import About from "@/pages/about";
import Reviews from "@/pages/reviews";
import Header from "./components/layout/Header";
import BottomTabBar from "./components/layout/BottomTabBar";
import Settings from "@/pages/settings";
import Scan from "@/pages/scan";
import Footer from "./components/layout/Footer";
import { useState, useEffect } from "react";

function MobileHidden({ children }: { children: React.ReactNode }) {
  return null; // Hidden on mobile app - re-enable for web if needed
}
import { AuthProvider, RequireAuth } from "@/hooks/use-auth";

// Router component
function AppRouter() {
  const [location] = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      {!["/profiles", "/"].includes(location) && <Header />}
      <main className="flex-grow overflow-hidden max-w-full" style={{ paddingBottom: "80px", paddingTop: "8px" }}>
        <Switch>
          {/* The component at "/" will now only be the welcome/tutorial page */}
          <Route path="/" component={Home} />
          
          {/* Profiles dashboard will be the main area for managing profiles */}
          <Route path="/profiles">
            <RequireAuth>
              <ProfilesDashboard />
            </RequireAuth>
          </Route>
          
          <Route path="/p/:slug" component={ProfilePage} />
          <Route path="/admin">
            <RequireAuth>
              <AdminPage />
            </RequireAuth>
          </Route>
          <Route path="/premium">
            <RequireAuth>
              <Premium />
            </RequireAuth>
          </Route>
          <Route path="/premium/success">
            <RequireAuth>
              <PremiumSuccess />
            </RequireAuth>
          </Route>
          <Route path="/analytics">
            <RequireAuth>
              <Analytics />
            </RequireAuth>
          </Route>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/help" component={Help} />
          <Route path="/about" component={About} />
          <Route path="/reviews" component={Reviews} />
          <Route path="/settings" component={Settings} />
          <Route path="/scan" component={Scan} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <MobileHidden><Footer /></MobileHidden>
      <BottomTabBar />
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
