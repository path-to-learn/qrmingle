import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import i18n from "@/i18n";

// Apply RTL direction on startup based on saved language preference
const savedLang = localStorage.getItem("qrmingle-language");
if (savedLang === "ar") document.documentElement.dir = "rtl";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProfilePage from "@/pages/profile-page";
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
import { App as CapApp } from "@capacitor/app";
import { scheduleHorizontalReset } from "@/lib/viewport";

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
  const [location, navigate] = useLocation();
  const isFullScreenRoute = ["/", "/login", "/register"].includes(location);

  // Handle Universal Links (iOS deep links) — navigate to the path when app opens via URL
  useEffect(() => {
    const listener = CapApp.addListener("appUrlOpen", (event) => {
      try {
        const url = new URL(event.url);
        const path = url.pathname + url.search;
        if (path && path !== "/") navigate(path);
      } catch {}
    });
    return () => { listener.then(h => h.remove()); };
  }, [navigate]);

  useEffect(() => {
    const reset = () => scheduleHorizontalReset();
    const viewport = window.visualViewport;

    window.addEventListener("resize", reset);
    window.addEventListener("orientationchange", reset);
    viewport?.addEventListener("resize", reset);
    viewport?.addEventListener("scroll", reset);

    return () => {
      window.removeEventListener("resize", reset);
      window.removeEventListener("orientationchange", reset);
      viewport?.removeEventListener("resize", reset);
      viewport?.removeEventListener("scroll", reset);
    };
  }, []);

  useEffect(() => {
    const className = "qrmingle-fullscreen-lock";
    document.documentElement.classList.toggle(className, isFullScreenRoute);
    document.body.classList.toggle(className, isFullScreenRoute);

    return () => {
      document.documentElement.classList.remove(className);
      document.body.classList.remove(className);
    };
  }, [isFullScreenRoute]);

  return (
    <div
      data-horizontal-lock
      className="min-h-screen flex flex-col"
      style={{
        overflowX: "hidden",
        overflowY: isFullScreenRoute ? "hidden" : undefined,
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        height: isFullScreenRoute ? "100dvh" : undefined,
        touchAction: "pan-y",
      }}
    >
      {!["/", "/login", "/register"].includes(location) && (
        location === "/profiles"
          ? <div className="profiles-header-wrap"><Header /></div>
          : <Header />
      )}
      {/* overflow-y on main, overflow-x on inner div — keeps them separate to avoid iOS WebKit scroll quirk */}
      <main data-horizontal-lock className="main-content flex-1 min-h-0 overflow-y-auto max-w-full" style={{
        ["--route-overflow-y" as string]: isFullScreenRoute ? "hidden" : "auto",
        paddingBottom: ["/", "/profiles", "/login", "/register"].includes(location) ? "0" : "80px",
        paddingTop: ["/", "/profiles", "/login", "/register"].includes(location) ? "0" : "8px",
        paddingLeft: ["/", "/profiles", "/login", "/register"].includes(location) ? "0" : "12px",
        paddingRight: ["/", "/profiles", "/login", "/register"].includes(location) ? "0" : "12px",
        overflowX: "hidden",
        overflowY: isFullScreenRoute ? "hidden" : undefined,
        height: isFullScreenRoute
          ? "100dvh"
          : location === "/profiles"
            ? "calc(100dvh - 60px - env(safe-area-inset-bottom))"
            : undefined,
      }}>
      <div data-horizontal-lock style={{ overflowX: "hidden", width: "100%", maxWidth: "100%", minWidth: 0, height: isFullScreenRoute ? "100%" : undefined }}>
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
          <Route path="/settings">
            <RequireAuth>
              <Settings />
            </RequireAuth>
          </Route>
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
