import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  BadgeCheck,
  ChevronRight,
  Crown,
  FileText,
  HelpCircle,
  Info,
  Languages,
  LogOut,
  Mail,
  RotateCcw,
  ScrollText,
  Shield,
  Star,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { isAdmin } from "@/lib/video";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { IAP } from "@/lib/iap";
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
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

const isNativeApp = Capacitor.isNativePlatform();

type SettingsRowProps = {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
  muted?: boolean;
  destructive?: boolean;
  showChevron?: boolean;
};

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ margin: "0 16px 18px" }}>
      <div style={{
        color: "#64748b",
        fontSize: "12px",
        fontWeight: 800,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        margin: "0 4px 8px",
      }}>
        {title}
      </div>
      <div style={{
        background: "white",
        border: "1px solid #eef2f7",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}>
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  color,
  onClick,
  disabled = false,
  muted = false,
  destructive = false,
  showChevron = true,
}: SettingsRowProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "grid",
        gridTemplateColumns: "40px minmax(0, 1fr) auto",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        minHeight: "58px",
        padding: "12px 14px",
        background: "white",
        border: "none",
        borderBottom: "1px solid #f1f5f9",
        cursor: disabled ? "default" : "pointer",
        textAlign: "left",
        WebkitTapHighlightColor: "transparent",
        opacity: disabled ? 0.65 : 1,
      }}
    >
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: color + "18",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Icon size={19} style={{ color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: "15px",
          fontWeight: 700,
          color: destructive ? "#dc2626" : muted ? "#64748b" : "#0f172a",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{
            fontSize: "12px",
            color: "#64748b",
            marginTop: "2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {sublabel}
          </div>
        )}
      </div>
      {showChevron && !disabled && (
        <ChevronRight size={18} style={{ color: "#cbd5e1" }} />
      )}
    </button>
  );
}

export default function Settings() {
  const {
    user,
    logoutMutation,
    deleteAccountMutation,
    isEffectivelyPremium,
    refetchUser,
  } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isRestoring, setIsRestoring] = useState(false);

  if (!user) return null;

  const isPremium = isEffectivelyPremium();

  const handleRestorePurchase = async () => {
    if (isRestoring) return;
    setIsRestoring(true);

    try {
      const { transactions } = await IAP.restorePurchases();
      if (transactions.length === 0) {
        toast({
          title: t("settings.restore.noneTitle", { defaultValue: "Nothing to restore" }),
          description: t("settings.restore.noneDescription", { defaultValue: "No previous Premium purchase was found." }),
        });
        return;
      }

      const res = await apiRequest("POST", "/api/iap/restore", { transactions });
      const data = await res.json();

      if (data.restored) {
        await refetchUser();
        toast({
          title: t("settings.restore.successTitle", { defaultValue: "Purchase restored" }),
          description: t("settings.restore.successDescription", { defaultValue: "Premium is active again." }),
        });
      } else {
        toast({
          title: t("settings.restore.noneTitle", { defaultValue: "Nothing to restore" }),
          description: t("settings.restore.noneDescription", { defaultValue: "No previous Premium purchase was found." }),
        });
      }
    } catch {
      toast({
        title: t("settings.restore.failedTitle", { defaultValue: "Restore failed" }),
        description: t("settings.restore.failedDescription", { defaultValue: "Please try again." }),
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div style={{
      paddingBottom: "calc(92px + env(safe-area-inset-bottom))",
      overflowX: "hidden",
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
      boxSizing: "border-box",
    }}>
      <div style={{
        background: "var(--app-accent, #6366f1)",
        padding: "24px 16px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        borderRadius: "0 0 24px 24px",
        marginBottom: "20px",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}>
        <Avatar style={{ width: "64px", height: "64px", flexShrink: 0 }}>
          <AvatarFallback style={{
            background: "rgba(255,255,255,0.3)",
            color: "white",
            fontSize: "24px",
            fontWeight: 700,
          }}>
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            color: "white",
            fontWeight: 800,
            fontSize: "18px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {user.username}
          </div>
          <div style={{ color: "rgba(255,255,255,0.82)", fontSize: "13px", marginTop: "3px" }}>
            {isPremium ? t("settings.premiumMember") : t("settings.freeAccount")}
          </div>
        </div>
      </div>

      <SettingsSection title={t("settings.sections.account", { defaultValue: "Account" })}>
        <SettingsRow
          icon={isPremium ? BadgeCheck : Crown}
          label={isPremium
            ? t("settings.menu.managePremium", { defaultValue: "Manage Premium" })
            : t("settings.menu.upgrade")}
          sublabel={isPremium
            ? t("settings.menu.managePremiumSub", { defaultValue: "Premium is active" })
            : t("settings.menu.upgradeSub", { defaultValue: "Unlock analytics and more" })}
          color={isPremium ? "#10b981" : "#f59e0b"}
          onClick={() => navigate("/premium")}
        />
        {isNativeApp && (
          <SettingsRow
            icon={RotateCcw}
            label={t("settings.menu.restorePurchase", { defaultValue: "Restore Purchase" })}
            sublabel={isRestoring
              ? t("settings.menu.restoringPurchase", { defaultValue: "Checking App Store..." })
              : t("settings.menu.restorePurchaseSub", { defaultValue: "Recover a previous Premium purchase" })}
            color="#6366f1"
            onClick={handleRestorePurchase}
            disabled={isRestoring}
          />
        )}
        {isAdmin(user) && (
          <SettingsRow
            icon={Shield}
            label={t("settings.menu.admin")}
            color="#6366f1"
            onClick={() => navigate("/admin")}
          />
        )}
      </SettingsSection>

      <SettingsSection title={t("settings.sections.preferences", { defaultValue: "Preferences" })}>
        <div style={{ padding: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "#6366f118",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Languages size={19} style={{ color: "#6366f1" }} />
            </div>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{t("settings.language")}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", minWidth: 0 }}>
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language?.startsWith(lang.code);
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    document.documentElement.dir = lang.code === "ar" ? "rtl" : "ltr";
                  }}
                  style={{
                    padding: "8px 4px",
                    borderRadius: "10px",
                    border: isActive ? "2px solid var(--app-accent, #6366f1)" : "2px solid #f1f5f9",
                    background: isActive ? "rgba(99,102,241,0.08)" : "#f8fafc",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "3px",
                    WebkitTapHighlightColor: "transparent",
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{lang.flag}</span>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? "var(--app-accent, #6366f1)" : "#64748b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}>
                    {lang.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title={t("settings.sections.support", { defaultValue: "Support" })}>
        <SettingsRow
          icon={HelpCircle}
          label={t("settings.menu.help")}
          color="#3b82f6"
          onClick={() => navigate("/help")}
        />
        <SettingsRow
          icon={Mail}
          label={t("settings.menu.contactSupport", { defaultValue: "Contact Support" })}
          sublabel="support@qrmingle.com"
          color="#0ea5e9"
          onClick={() => {
            window.location.href = "mailto:support@qrmingle.com";
          }}
        />
        <SettingsRow
          icon={Star}
          label={t("settings.menu.reviews")}
          sublabel={t("settings.menu.reviewsSub", { defaultValue: "Read and share QrMingle reviews" })}
          color="#10b981"
          onClick={() => navigate("/reviews")}
        />
      </SettingsSection>

      <SettingsSection title={t("settings.sections.legal", { defaultValue: "Legal" })}>
        <SettingsRow
          icon={FileText}
          label={t("settings.menu.privacy")}
          sublabel={t("settings.privacy.sub")}
          color="#64748b"
          onClick={() => navigate("/privacy")}
        />
        <SettingsRow
          icon={ScrollText}
          label={t("settings.menu.terms", { defaultValue: "Terms of Service" })}
          color="#64748b"
          onClick={() => navigate("/terms")}
        />
        <SettingsRow
          icon={Info}
          label={t("settings.menu.about")}
          color="#64748b"
          onClick={() => navigate("/about")}
        />
      </SettingsSection>

      <SettingsSection title={t("settings.sections.session", { defaultValue: "Session" })}>
        <SettingsRow
          icon={LogOut}
          label={t("settings.logout")}
          color="#ef4444"
          destructive
          showChevron={false}
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        />
      </SettingsSection>

      <SettingsSection title={t("settings.sections.danger", { defaultValue: "Danger Zone" })}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              style={{
                display: "grid",
                gridTemplateColumns: "40px minmax(0, 1fr) auto",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                minHeight: "58px",
                padding: "12px 14px",
                background: "white",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Trash2 size={19} style={{ color: "#94a3b8" }} />
              </div>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#64748b" }}>{t("settings.deleteAccount")}</span>
              <ChevronRight size={18} style={{ color: "#cbd5e1" }} />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("settings.deleteDialog.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("settings.deleteDialog.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("settings.deleteDialog.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAccountMutation.mutate()}
                style={{ background: "#ef4444" }}
              >
                {t("settings.deleteDialog.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SettingsSection>
    </div>
  );
}
