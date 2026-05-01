import { useLocation } from "wouter";
import { CreditCard, QrCode, BarChart2, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const tabs = [
  { path: "/profiles", icon: CreditCard, label: "Cards" },
  { path: "/scan", icon: QrCode, label: "Scan" },
  { path: "/analytics", icon: BarChart2, label: "Analytics" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomTabBar() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div
      className="bottom-tab-bar"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--color-background-primary, #fff)",
        borderTop: "1px solid var(--color-border-tertiary, #e5e7eb)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingTop: "8px",
        zIndex: 50,
        height: "calc(60px + env(safe-area-inset-bottom))",
      }}
    >
      {tabs.map((tab) => {
        const isActive = location === tab.path || 
          (tab.path === "/profiles" && location === "/");
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px 16px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              minHeight: "44px",
              minWidth: "60px",
              touchAction: "manipulation",
            }}
          >
            <Icon
              size={22}
              style={{
                color: isActive ? "var(--app-accent, #6366f1)" : "var(--color-text-tertiary, #9ca3af)",
                strokeWidth: isActive ? 2.5 : 1.5,
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--app-accent, #6366f1)" : "var(--color-text-tertiary, #9ca3af)",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
