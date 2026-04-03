import { useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, User, BarChart2, Crown, Clock, Shield, ChevronDown, X } from "lucide-react";
import { isAdmin } from "@/lib/video";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const { user, logoutMutation, isEffectivelyPremium } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [, navigate] = useLocation();
  const [isLoginPage] = useRoute("/login");
  const [isRegisterPage] = useRoute("/register");
  const isAuthPage = isLoginPage || isRegisterPage;

  const isInTrialMode = user && !user.isPremium && user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date();

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

  if (user && !user.isPremium) {
    menuItems.push({ icon: <Crown className="h-5 w-5" />, label: "Upgrade to Premium", path: "/premium" });
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {isInTrialMode && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center text-sm py-1">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Premium trial active - {formatTrialExpiry()}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <img src="/qrmingle-logo-bright.svg" alt="QrMingle Logo" className="h-8 w-8" />
            <span className="font-bold text-xl text-primary">QrMingle</span>
          </div>
        </Link>

        <div>
          {user ? (
            <>
              {/* Avatar button - hidden on native app since Settings tab handles navigation */}
              {!(window as any).Capacitor && (
              <button
                onClick={() => setShowMenu(true)}
                style={{ WebkitTapHighlightColor: 'transparent', minHeight: '44px', minWidth: '44px', touchAction: 'manipulation' }}
                className="flex items-center gap-1 p-2 rounded-lg"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              )}

              {/* Mobile slide-in menu */}
              {showMenu && (
                <div className="fixed inset-0 z-50" style={{ touchAction: 'none' }}>
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setShowMenu(false)}
                  />
                  {/* Menu panel */}
                  <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium truncate max-w-[160px]">{user.username}</span>
                      </div>
                      <button
                        onClick={() => setShowMenu(false)}
                        className="p-2 rounded-lg hover:bg-muted"
                        style={{ minHeight: '44px', minWidth: '44px' }}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Menu items */}
                    <div className="flex-1 p-3 space-y-1">
                      {menuItems.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => { navigate(item.path); setShowMenu(false); }}
                          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted text-left"
                          style={{ minHeight: '52px', touchAction: 'manipulation' }}
                        >
                          <span className="text-muted-foreground">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="p-3 border-t">
                      <button
                        onClick={() => { logoutMutation.mutate(); setShowMenu(false); }}
                        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-50 text-red-600"
                        style={{ minHeight: '52px', touchAction: 'manipulation' }}
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
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
