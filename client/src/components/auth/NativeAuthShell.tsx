import { useEffect, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { ChevronLeft, KeyRound, LockKeyhole, Mail } from "lucide-react";

type NativeAuthMode = "login" | "register";
type NativeAuthFieldIcon = "email" | "password" | "key";

type NativeAuthShellProps = {
  chip: string;
  title: ReactNode;
  subtitle: ReactNode;
  activeMode?: NativeAuthMode;
  onModeChange?: (mode: NativeAuthMode) => void;
  onBack: () => void;
  backLabel: string;
  children: ReactNode;
  primaryLabel?: string;
  isSubmitting?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onPrimaryAction?: () => void;
  footer?: ReactNode;
};

type NativeAuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: NativeAuthFieldIcon;
};

const accent = "#6366f1";
const ink = "#0f172a";
const muted = "#64748b";

function BrandMark() {
  return (
    <svg width="38" height="38" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="512" height="512" rx="256" fill={accent} />
      <g opacity="0.95">
        <rect x="144" y="144" width="80" height="80" rx="16" fill="white" />
        <rect x="160" y="160" width="48" height="48" rx="8" fill="rgba(255,255,255,0.35)" />
        <rect x="288" y="144" width="80" height="80" rx="16" fill="white" />
        <rect x="304" y="160" width="48" height="48" rx="8" fill="rgba(255,255,255,0.35)" />
        <rect x="144" y="288" width="80" height="80" rx="16" fill="white" />
        <rect x="160" y="304" width="48" height="48" rx="8" fill="rgba(255,255,255,0.35)" />
        <rect x="240" y="144" width="32" height="32" rx="6" fill="rgba(255,255,255,0.7)" />
        <rect x="240" y="192" width="32" height="32" rx="6" fill="rgba(255,255,255,0.5)" />
        <rect x="240" y="240" width="32" height="32" rx="6" fill="rgba(255,255,255,0.7)" />
        <rect x="288" y="240" width="32" height="32" rx="6" fill="rgba(255,255,255,0.6)" />
        <rect x="336" y="240" width="32" height="32" rx="6" fill="rgba(255,255,255,0.45)" />
        <rect x="336" y="288" width="32" height="32" rx="6" fill="rgba(255,255,255,0.55)" />
        <rect x="336" y="336" width="32" height="32" rx="6" fill="rgba(255,255,255,0.7)" />
      </g>
    </svg>
  );
}

function FieldIcon({ icon }: { icon: NativeAuthFieldIcon }) {
  const Icon = icon === "password" ? LockKeyhole : icon === "key" ? KeyRound : Mail;
  return <Icon size={22} color={accent} strokeWidth={2.3} />;
}

export function NativeAuthField({ label, icon = "email", style, ...inputProps }: NativeAuthFieldProps) {
  return (
    <label style={{ display: "block" }}>
      <span style={{
        display: "block",
        color: muted,
        fontSize: "13px",
        fontWeight: 700,
        marginBottom: "8px",
      }}>
        {label}
      </span>
      <span style={{
        alignItems: "center",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
        display: "flex",
        gap: "12px",
        minHeight: "58px",
        padding: "0 18px",
      }}>
        <FieldIcon icon={icon} />
        <input
          {...inputProps}
          style={{
            background: "transparent",
            border: "none",
            color: ink,
            flex: "1 1 0",
            fontSize: "16px",
            fontWeight: 650,
            minWidth: 0,
            outline: "none",
            ...style,
          }}
        />
      </span>
    </label>
  );
}

export function NativeAuthPill({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "amber" }) {
  const colors = {
    blue: { background: "#eef2ff", color: accent },
    green: { background: "#dcfce7", color: "#166534" },
    amber: { background: "#fef3c7", color: "#92400e" },
  }[tone];

  return (
    <span style={{
      background: colors.background,
      borderRadius: "999px",
      color: colors.color,
      display: "inline-flex",
      fontSize: "12px",
      fontWeight: 750,
      padding: "7px 14px",
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

export default function NativeAuthShell({
  chip,
  title,
  subtitle,
  activeMode,
  onModeChange,
  onBack,
  backLabel,
  children,
  primaryLabel,
  isSubmitting,
  onSubmit,
  onPrimaryAction,
  footer,
}: NativeAuthShellProps) {
  const [shellHeight, setShellHeight] = useState<number | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      const activeElement = document.activeElement;
      const isInputFocused = activeElement instanceof HTMLElement
        && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName);

      if (!isInputFocused) {
        setShellHeight(window.innerHeight);
      }
    };

    updateHeight();

    const updateAfterOrientation = () => {
      window.setTimeout(() => {
        setShellHeight(window.innerHeight);
      }, 250);
    };

    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateAfterOrientation);

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateAfterOrientation);
    };
  }, []);

  const formBody = (
    <>
      <div style={{
        background: "rgba(255,255,255,0.97)",
        border: "1px solid #e8edf5",
        borderRadius: "22px",
        boxShadow: "0 12px 28px rgba(15,23,42,0.07)",
        padding: "22px",
        width: "100%",
      }}>
        {children}
      </div>

      {primaryLabel && (
        <button
          type={onSubmit ? "submit" : "button"}
          onClick={onSubmit ? undefined : onPrimaryAction}
          disabled={isSubmitting}
          style={{
            background: accent,
            border: "none",
            borderRadius: "16px",
            boxShadow: "0 12px 24px rgba(99,102,241,0.22)",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: 700,
            minHeight: "54px",
            opacity: isSubmitting ? 0.7 : 1,
            width: "100%",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {primaryLabel}
        </button>
      )}
    </>
  );

  return (
    <div style={{
      background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 46%, #f8fafc 100%)",
      color: ink,
      height: shellHeight ? `${shellHeight}px` : "100svh",
      minHeight: shellHeight ? `${shellHeight}px` : "100svh",
      overscrollBehaviorY: "contain",
      overflowX: "hidden",
      overflowY: "auto",
      padding: "max(8px, env(safe-area-inset-top)) 24px max(22px, env(safe-area-inset-bottom))",
      position: "relative",
      transform: "translateZ(0)",
      WebkitOverflowScrolling: "touch",
      width: "100%",
    }}>
      <div style={{ margin: "0 auto", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        <header style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "24px",
          paddingTop: 0,
        }}>
          <button
            onClick={onBack}
            style={{
              alignItems: "center",
              background: "transparent",
              border: "none",
              color: ink,
              display: "flex",
              gap: "10px",
              padding: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <BrandMark />
            <span style={{ fontSize: "24px", fontWeight: 700 }}>QrMingle</span>
          </button>

          <button
            onClick={onBack}
            style={{
              alignItems: "center",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "999px",
              color: "#334155",
              display: "inline-flex",
              fontSize: "13px",
              fontWeight: 750,
              gap: "2px",
              minHeight: "36px",
              padding: "0 13px 0 9px",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <ChevronLeft size={16} />
            {backLabel}
          </button>
        </header>

        <NativeAuthPill>{chip}</NativeAuthPill>

        <h1 style={{
          color: "#172033",
          fontSize: "clamp(26px, 7.2vw, 30px)",
          fontWeight: 650,
          lineHeight: 1.2,
          margin: "16px 0 0",
        }}>
          {title}
        </h1>
        <p style={{
          color: muted,
          fontSize: "15px",
          lineHeight: 1.48,
          margin: "18px 0 26px",
          maxWidth: "330px",
        }}>
          {subtitle}
        </p>

        {activeMode && onModeChange && (
          <div style={{
            background: "white",
            border: "1px solid #e8edf5",
            borderRadius: "18px",
            boxShadow: "0 10px 24px rgba(15,23,42,0.07)",
            display: "grid",
            gap: "8px",
            gridTemplateColumns: "1fr 1fr",
            marginBottom: "20px",
            padding: "7px",
          }}>
            {(["login", "register"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onModeChange(mode)}
                style={{
                  background: activeMode === mode ? accent : "#f1f5f9",
                  border: "none",
                  borderRadius: "13px",
                  color: activeMode === mode ? "white" : muted,
                  fontSize: "14px",
                  fontWeight: 650,
                  minHeight: "42px",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {mode === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>
        )}

        {onSubmit ? (
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            {formBody}
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            {formBody}
          </div>
        )}

        {footer && (
          <div style={{
            color: muted,
            fontSize: "13px",
            fontWeight: 650,
            lineHeight: 1.5,
            marginTop: "18px",
            textAlign: "center",
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
