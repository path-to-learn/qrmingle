import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { LogOut, Crown, Shield, Star, HelpCircle, FileText, Info, Trash2, Languages } from "lucide-react";
import { isAdmin } from "@/lib/video";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

export default function Settings() {
  const { user, logoutMutation, deleteAccountMutation, isEffectivelyPremium } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  if (!user) return null;

  const menuItems = [
    ...(!user.isPremium ? [{ icon: Crown, label: t('settings.menu.upgrade'), path: "/premium", color: "#f59e0b" }] : []),
    ...(isAdmin(user) ? [{ icon: Shield, label: t('settings.menu.admin'), path: "/admin", color: "#6366f1" }] : []),
    { icon: Star, label: t('settings.menu.reviews'), path: "/reviews", color: "#10b981" },
    { icon: HelpCircle, label: t('settings.menu.help'), path: "/help", color: "#3b82f6" },
    { icon: FileText, label: t('settings.menu.privacy'), path: "/privacy", color: "#64748b" },
    { icon: Info, label: t('settings.menu.about'), path: "/about", color: "#64748b" },
  ];

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* Profile header */}
      <div style={{
        background: "var(--app-accent, #6366f1)",
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
            {user.isPremium ? t('settings.premiumMember') : t('settings.freeAccount')}
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div style={{
        margin: "0 16px 16px",
        padding: "12px 16px",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <span style={{ fontSize: "20px" }}>🔒</span>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#15803d" }}>{t('settings.privacy.title')}</div>
          <div style={{ fontSize: "12px", color: "#166534", marginTop: "2px" }}>{t('settings.privacy.sub')}</div>
        </div>
      </div>

      {/* Language picker */}
      <div style={{
        margin: "0 16px 16px",
        padding: "14px 16px",
        background: "white",
        border: "1px solid #f1f5f9",
        borderRadius: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "#6366f118",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Languages size={18} style={{ color: "#6366f1" }} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 500, color: "#1e293b" }}>{t('settings.language')}</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {LANGUAGES.map((lang) => {
            const isActive = i18n.language?.startsWith(lang.code);
            return (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  borderRadius: "10px",
                  border: isActive ? "2px solid var(--app-accent, #6366f1)" : "2px solid #f1f5f9",
                  background: isActive ? "var(--app-accent, #6366f1)" + "14" : "#f8fafc",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span style={{ fontSize: "20px" }}>{lang.flag}</span>
                <span style={{
                  fontSize: "10px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--app-accent, #6366f1)" : "#64748b",
                }}>{lang.label}</span>
              </button>
            );
          })}
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
          <span style={{ fontSize: "15px", fontWeight: 500, color: "#ef4444" }}>{t('settings.logout')}</span>
        </button>

        {/* Delete Account */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
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
                background: "#f8fafc",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Trash2 size={18} style={{ color: "#94a3b8" }} />
              </div>
              <span style={{ fontSize: "15px", fontWeight: 500, color: "#94a3b8" }}>{t('settings.deleteAccount')}</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('settings.deleteDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('settings.deleteDialog.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('settings.deleteDialog.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAccountMutation.mutate()}
                style={{ background: "#ef4444" }}
              >
                {t('settings.deleteDialog.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
