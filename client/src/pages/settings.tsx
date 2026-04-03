import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { LogOut, Crown, Shield, Star, HelpCircle, FileText, Info } from "lucide-react";
import { isAdmin } from "@/lib/video";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Settings() {
  const { user, logoutMutation, isEffectivelyPremium } = useAuth();
  const [, navigate] = useLocation();

  if (!user) return null;

  const menuItems = [
    ...(!user.isPremium ? [{ icon: Crown, label: "Upgrade to Premium", path: "/premium", color: "#f59e0b" }] : []),
    ...(isAdmin(user) ? [{ icon: Shield, label: "Admin Panel", path: "/admin", color: "#6366f1" }] : []),
    { icon: Star, label: "Reviews", path: "/reviews", color: "#10b981" },
    { icon: HelpCircle, label: "Help Center", path: "/help", color: "#3b82f6" },
    { icon: FileText, label: "Privacy Policy", path: "/privacy", color: "#64748b" },
    { icon: Info, label: "About", path: "/about", color: "#64748b" },
  ];

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* Profile header */}
      <div style={{
        background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
        padding: "24px 16px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        borderRadius: "0 0 24px 24px",
        marginBottom: "16px",
      }}>
        <Avatar style={{ width: "64px", height: "64px" }}>
          <AvatarFallback style={{
            background: "rgba(255,255,255,0.3)",
            color: "white",
            fontSize: "24px",
            fontWeight: 700,
          }}>
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: "18px" }}>{user.username}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
            {user.isPremium ? "✓ Premium member" : "Free account"}
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                background: "white",
                border: "1px solid #f1f5f9",
                borderRadius: "12px",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                WebkitTapHighlightColor: "transparent",
                minHeight: "52px",
              }}
            >
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: item.color + "18",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={18} style={{ color: item.color }} />
              </div>
              <span style={{ fontSize: "15px", fontWeight: 500, color: "#1e293b" }}>{item.label}</span>
              <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: "18px" }}>›</span>
            </button>
          );
        })}

        {/* Logout */}
        <button
          onClick={() => logoutMutation.mutate()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "14px 16px",
            background: "#fff5f5",
            border: "1px solid #fee2e2",
            borderRadius: "12px",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            WebkitTapHighlightColor: "transparent",
            minHeight: "52px",
            marginTop: "8px",
          }}
        >
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "#fee2e2",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LogOut size={18} style={{ color: "#ef4444" }} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 500, color: "#ef4444" }}>Logout</span>
        </button>
      </div>
    </div>
  );
}
