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
import CardsPage from "@/pages/cards";
import BottomTabBar from "./components/layout/BottomTabBar";
import Settings from "@/pages/settings";
import Scan from "@/pages/scan";
import Footer from "./components/layout/Footer";
import { useState, useEffect } from "react";

function MobileHidden({ children }: { children: React.ReactNode }) {
  return null; // Hidden on mobile app - re-enable for web if needed
}
import { AuthProvider, RequireAuth } from "@/hooks/use-auth";

function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (!offline) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
      background: "#1e293b", color: "white",
      textAlign: "center", fontSize: "13px", fontWeight: 600,
      padding: "10px 16px",
      paddingTop: "calc(10px + env(safe-area-inset-top))",
    }}>
      No internet connection — some features may be unavailable
    </div>
  );
}

// Router component
function AppRouter() {
  const [location] = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      {!["/", "/login", "/register"].includes(location) && (
        location === "/profiles"
          ? <div className="profiles-header-wrap" style={{ display: "none" }}><Header /></div>
          : <Header />
      )}
      {/* overflow-y on main, overflow-x on inner div — keeps them separate to avoid iOS WebKit scroll quirk */}
      <main className="main-content flex-1 min-h-0 overflow-y-auto max-w-full" style={{
        paddingBottom: ["/", "/login", "/register"].includes(location) ? "0" : "80px",
        paddingTop: ["/", "/login", "/register"].includes(location) ? "0" : "8px",
        paddingLeft: ["/", "/profiles", "/login", "/register"].includes(location) ? "0" : "12px",
        paddingRight: ["/", "/profiles", "/login", "/register"].includes(location) ? "0" : "12px",
        overflowX: "hidden",
      }}>
      <div style={{ overflowX: "hidden", width: "100%" }}>
        <Switch>
          {/* The component at "/" will now only be the welcome/tutorial page */}
          <Route path="/" component={Home} />
          
          {/* Profiles dashboard will be the main area for managing profiles */}
          <Route path="/profiles">
            <RequireAuth>
              <CardsPage />
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
      </div>
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
        <OfflineBanner />
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
