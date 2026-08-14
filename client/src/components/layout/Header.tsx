import { useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, User, BarChart2, Crown, Clock, Shield, ChevronDown } from "lucide-react";
import { isAdmin } from "@/lib/video";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Capacitor } from "@capacitor/core";
import { PREMIUM_PURCHASES_ENABLED } from "@shared/premium";

export default function Header() {
  const { user, logoutMutation, isEffectivelyPremium } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [, navigate] = useLocation();
  const [isLoginPage] = useRoute("/login");
  const [isRegisterPage] = useRoute("/register");
  const isAuthPage = isLoginPage || isRegisterPage;
  const isNativeApp = Capacitor.isNativePlatform();

  const isInTrialMode = user && !user.isPremium && user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date();
  const isPremium = user ? isEffectivelyPremium() : false;

  const formatTrialExpiry = () => {
    if (!user?.trialExpiresAt) return '';
    const expiryDate = new Date(user.trialExpiresAt);
    const today = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
    return expiryDate.toLocaleDateString();
  };

  const menuItems = [
    { icon: <User className="h-5 w-5" />, label: "My Profiles", path: "/profiles" },
    { icon: <BarChart2 className="h-5 w-5" />, label: "Analytics", path: "/analytics" },
    { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>, label: "Reviews", path: "/reviews" },
  ];

  if (user && isAdmin(user)) {
    menuItems.push({ icon: <Shield className="h-5 w-5" />, label: "Admin Panel", path: "/admin" });
  }

  if (user && !isPremium && PREMIUM_PURCHASES_ENABLED) {
    menuItems.push({ icon: <Crown className="h-5 w-5" />, label: "Upgrade to Premium", path: "/premium" });
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10" style={{ paddingTop: isNativeApp ? 0 : "env(safe-area-inset-top)", width: "100%", maxWidth: "100vw", overflowX: "hidden" }}>
      {isInTrialMode && (
        <div className="text-white text-center text-sm py-1" style={{ background: "var(--app-accent, #6366f1)" }}>
          <div className="container mx-auto px-4 flex items-center justify-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Premium trial active - {formatTrialExpiry()}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="512" height="512" rx="256" fill="var(--app-accent, #6366f1)"/>
              <g opacity="0.95">
                <rect x="144" y="144" width="80" height="80" rx="16" fill="white"/>
                <rect x="160" y="160" width="48" height="48" rx="8" fill="rgba(255,255,255,0.35)"/>
                <rect x="288" y="144" width="80" height="80" rx="16" fill="white"/>
                <rect x="304" y="160" width="48" height="48" rx="8" fill="rgba(255,255,255,0.35)"/>
                <rect x="144" y="288" width="80" height="80" rx="16" fill="white"/>
                <rect x="160" y="304" width="48" height="48" rx="8" fill="rgba(255,255,255,0.35)"/>
                <rect x="240" y="144" width="32" height="32" rx="6" fill="rgba(255,255,255,0.7)"/>
                <rect x="240" y="192" width="32" height="32" rx="6" fill="rgba(255,255,255,0.5)"/>
                <rect x="240" y="240" width="32" height="32" rx="6" fill="rgba(255,255,255,0.7)"/>
                <rect x="240" y="288" width="32" height="32" rx="6" fill="rgba(255,255,255,0.5)"/>
                <rect x="288" y="240" width="32" height="32" rx="6" fill="rgba(255,255,255,0.6)"/>
                <rect x="336" y="240" width="32" height="32" rx="6" fill="rgba(255,255,255,0.4)"/>
                <rect x="144" y="240" width="32" height="32" rx="6" fill="rgba(255,255,255,0.6)"/>
                <rect x="192" y="240" width="32" height="32" rx="6" fill="rgba(255,255,255,0.4)"/>
                <rect x="288" y="336" width="32" height="32" rx="6" fill="rgba(255,255,255,0.5)"/>
                <rect x="336" y="336" width="32" height="32" rx="6" fill="rgba(255,255,255,0.7)"/>
                <rect x="336" y="288" width="32" height="32" rx="6" fill="rgba(255,255,255,0.5)"/>
              </g>
            </svg>
            <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--app-accent, #6366f1)" }}>QrMingle</span>
          </div>
        </Link>

        <div>
          {user ? (
            <>
              {/* Avatar account modal - hidden on native app since Settings tab handles navigation */}
              {!Capacitor.isNativePlatform() && (
                <Dialog open={showMenu} onOpenChange={setShowMenu}>
                  <DialogTrigger asChild>
                    <button
                      style={{ WebkitTapHighlightColor: 'transparent', minHeight: '44px', minWidth: '44px', touchAction: 'manipulation' }}
                      className="flex items-center gap-1 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback style={{ background: "var(--app-accent, #6366f1)", color: "white" }} className="font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[calc(100vw-32px)] max-w-md border-0 p-0 overflow-hidden rounded-2xl shadow-2xl [&>button]:text-white [&>button]:hover:text-white">
                    <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-slate-900 p-5 text-white">
                      <DialogHeader className="text-left space-y-3">
                        <div className="flex items-center gap-3 pr-8">
                          <Avatar className="h-12 w-12 border border-white/25">
                            <AvatarFallback className="bg-white/20 text-white font-bold text-lg">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <DialogTitle className="text-xl font-semibold text-white">Account</DialogTitle>
                            <DialogDescription className="text-indigo-100 truncate">
                              {user.username}
                            </DialogDescription>
                          </div>
                        </div>
                        <div className="inline-flex w-fit items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                          {isPremium ? "Premium active" : "Free account"}
                        </div>
                      </DialogHeader>
                    </div>

                    <div className="p-4">
                      <div className="grid gap-2">
                        {menuItems.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => { navigate(item.path); setShowMenu(false); }}
                            className="flex min-h-[56px] w-full items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-left transition-colors hover:bg-slate-50"
                            style={{ touchAction: 'manipulation' }}
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              {item.icon}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold text-slate-900">{item.label}</span>
                              <span className="block text-xs text-slate-500">
                                {item.label === "My Profiles"
                                  ? "Manage and edit your QR cards"
                                  : item.label === "Analytics"
                                    ? "Review profile scans and activity"
                                    : item.label === "Reviews"
                                      ? "Read and share feedback"
                                      : item.label === "Admin Panel"
                                        ? "Open admin controls"
                                        : "Unlock premium features"}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <button
                          onClick={() => { logoutMutation.mutate(); setShowMenu(false); }}
                          className="flex min-h-[52px] w-full items-center gap-3 rounded-xl bg-red-50 p-3 text-left text-red-600 transition-colors hover:bg-red-100"
                          style={{ touchAction: 'manipulation' }}
                          disabled={logoutMutation.isPending}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600">
                            <LogOut className="h-5 w-5" />
                          </span>
                          <span className="font-semibold">
                            {logoutMutation.isPending ? "Logging out..." : "Logout"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </>
          ) : (
            !isAuthPage && (
              <Link href="/login">
                <Button variant="link" className="text-muted-foreground hover:text-primary">
                  <User className="h-4 w-4 mr-1" />
                  Sign In
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
