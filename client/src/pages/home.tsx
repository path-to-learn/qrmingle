import { useCallback, useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, useSearch } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight,
  CheckCircle2,
  Github,
  Globe,
  Instagram,
  KeyRound,
  Linkedin,
  LockKeyhole,
  Mail,
  Phone,
  QrCode,
  Share2,
  Sparkles,
  LogIn,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";
import { getActiveThemes } from "@/data/themes";
import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";

type DemoLink = { Icon: LucideIcon; text: string };

type DemoCard = {
  badge: string;
  displayName: string;
  title: string;
  accent: string;
  gradient: string;
  initial: string;
  qrSlug: string;
  links: DemoLink[];
};

type WebStoryStep = {
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
  panel: string;
  Icon: LucideIcon;
};

const DEMO_CARDS: DemoCard[] = [
  {
    badge: "Professional",
    displayName: "Sarah Chen",
    title: "Sr. Engineer, Meta",
    accent: "#2d6a9f",
    gradient: "linear-gradient(160deg, #1e3a5f 0%, #2d6a9f 100%)",
    initial: "S",
    qrSlug: "sarah-chen",
    links: [
      { Icon: Linkedin, text: "linkedin.com/in/sarahchen" },
      { Icon: Github, text: "github.com/sarahchen" },
    ],
  },
  {
    badge: "Teacher",
    displayName: "David Okonkwo",
    title: "High School Math Teacher",
    accent: "#2d9b5d",
    gradient: "linear-gradient(160deg, #1a5c38 0%, #2d9b5d 100%)",
    initial: "D",
    qrSlug: "david-okonkwo",
    links: [
      { Icon: Mail, text: "d.okonkwo@school.edu" },
      { Icon: Globe, text: "mrokonkwo.com" },
    ],
  },
  {
    badge: "Contractor",
    displayName: "Mike Torres",
    title: "General Contractor",
    accent: "#c2740a",
    gradient: "linear-gradient(160deg, #7c3a00 0%, #c2740a 100%)",
    initial: "M",
    qrSlug: "mike-torres",
    links: [
      { Icon: Phone, text: "+1 (555) 234-5678" },
      { Icon: Globe, text: "torresbuilds.com" },
    ],
  },
  {
    badge: "Homemaker",
    displayName: "Priya Sharma",
    title: "Food Blogger & Home Chef",
    accent: "#c026a0",
    gradient: "linear-gradient(160deg, #6b0f52 0%, #c026a0 100%)",
    initial: "P",
    qrSlug: "priya-sharma",
    links: [
      { Icon: Instagram, text: "@priyaskitchen" },
      { Icon: Globe, text: "priyaskitchen.com" },
    ],
  },
  {
    badge: "Student",
    displayName: "Jordan Lee",
    title: "CS Student, Stanford '26",
    accent: "#0884b4",
    gradient: "linear-gradient(160deg, #0c4a6e 0%, #0884b4 100%)",
    initial: "J",
    qrSlug: "jordan-lee",
    links: [
      { Icon: Linkedin, text: "linkedin.com/in/jordanlee" },
      { Icon: Mail, text: "jordan@stanford.edu" },
    ],
  },
];

const WEB_STORY_STEPS: WebStoryStep[] = [
  {
    eyebrow: "Scan",
    title: "The paper card turns digital.",
    body: "Point the camera at a business card and QrMingle starts shaping it into a profile people can open instantly.",
    accent: "#4f46e5",
    panel: "linear-gradient(135deg, #eef2ff 0%, #ecfeff 100%)",
    Icon: QrCode,
  },
  {
    eyebrow: "Share",
    title: "One link works everywhere.",
    body: "Every profile gets a public QR link, so the same card can live in messages, emails, resumes, badges, and events.",
    accent: "#0f766e",
    panel: "linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%)",
    Icon: Share2,
  },
  {
    eyebrow: "AI Builder",
    title: "Describe it. QrMingle builds the card.",
    body: "Type a few lines about someone and AI drafts the profile, role, links, and card style so you can refine instead of starting from a blank form.",
    accent: "#7c3aed",
    panel: "linear-gradient(135deg, #f5f3ff 0%, #fff7ed 100%)",
    Icon: Sparkles,
  },
];

type WebAuthMode = "login" | "register" | "forgot";

const isNativeApp = Capacitor.isNativePlatform();

function MiniCard({
  card,
  isActive = false,
  presentation = "carousel",
}: {
  card: DemoCard;
  isActive?: boolean;
  presentation?: "carousel" | "static";
}) {
  const { badge, displayName, title, accent, gradient, initial, qrSlug, links } = card;
  const isStatic = presentation === "static";

  return (
    <div style={{
      flexShrink: 0,
      width: "272px",
      borderRadius: "20px",
      overflow: "hidden",
      transform: isStatic ? "none" : isActive ? "scaleX(1.08) scaleY(1.05)" : "scale(0.92)",
      transformOrigin: "center center",
      opacity: isStatic ? 1 : isActive ? 1 : 0.72,
      filter: isStatic ? "none" : isActive ? "saturate(1.06)" : "saturate(0.78) brightness(0.92)",
      transition: isStatic ? "none" : "transform 260ms ease, opacity 260ms ease, filter 260ms ease, box-shadow 260ms ease",
      boxShadow: isStatic
        ? "0 12px 30px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.18)"
        : isActive
        ? "0 22px 56px rgba(0,0,0,0.52), 0 0 0 2px rgba(255,255,255,0.72)"
        : "0 12px 34px rgba(0,0,0,0.34), 0 0 0 1px rgba(255,255,255,0.12)",
    }}>
      {/* Hero section */}
      <div style={{ height: "136px", background: gradient, position: "relative" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 75% 25%, rgba(255,255,255,0.1) 0%, transparent 55%)",
        }} />

        {/* Badge */}
        <div style={{
          position: "absolute", top: "11px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.38)", backdropFilter: "blur(6px)",
          color: "white", fontSize: "8px", fontWeight: 700,
          padding: "3px 12px", borderRadius: "5px",
          letterSpacing: "1.2px", textTransform: "uppercase", whiteSpace: "nowrap",
        }}>{badge}</div>

        {/* Avatar */}
        <div style={{
          position: "absolute", bottom: "9px", left: "13px",
          width: "38px", height: "38px", borderRadius: "50%",
          border: "2px solid white",
          background: gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          fontSize: "14px", fontWeight: 700, color: "white",
        }}>{initial}</div>

        {/* Wave */}
        <svg viewBox="0 0 400 48" style={{
          position: "absolute", bottom: 0, width: "100%", height: "38px", display: "block", zIndex: 1,
        }} preserveAspectRatio="none">
          <path d="M0,24 C80,48 200,4 400,28 L400,48 L0,48 Z" fill="white" />
        </svg>
      </div>

      {/* Info section */}
      <div style={{ background: "white", padding: "9px 12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", paddingLeft: "46px" }}>
          <div style={{ flex: 1, minWidth: 0, paddingLeft: "9px", borderLeft: `3px solid ${accent}` }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
          </div>
          <div style={{
            flexShrink: 0, padding: "3px", borderRadius: "7px",
            border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}>
            <QRCodeSVG value={`https://qrmingle.com/p/${qrSlug}`} size={40} fgColor={accent} bgColor="white" level="L" />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {links.map(({ Icon, text }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{
                width: "22px", height: "22px", borderRadius: "50%",
                background: accent, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={11} color="white" />
              </div>
              <span style={{ fontSize: "10px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home({ authMode }: { authMode?: WebAuthMode } = {}) {
  return isNativeApp ? <NativeHome /> : <WebHome authMode={authMode} />;
}

function WebHome({ authMode }: { authMode?: WebAuthMode }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const TAGLINES = t('home.taglines', { returnObjects: true }) as string[];

  useEffect(() => {
    if (user) navigate("/profiles");
  }, [user, navigate]);

  if (user) return null;

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#f8fafc",
      color: "#0f172a",
      overflowX: "hidden",
    }}>
      <header style={{
        width: "100%",
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "24px 28px 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "18px",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <WebLogo size={44} />
          <span style={{ fontSize: "28px", fontWeight: 800, color: "#111827", whiteSpace: "nowrap" }}>QrMingle</span>
        </div>

        <button
          onClick={() => navigate("/login")}
          style={{
            border: "1px solid #dbe2ea",
            background: "white",
            color: "#1f2937",
            borderRadius: "10px",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
            whiteSpace: "nowrap",
          }}
        >
          {t('home.signIn')}
        </button>
      </header>

      <main style={{
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <section style={{
          position: "relative",
          width: "100%",
          minHeight: "min(780px, calc(100vh - 86px))",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "58px 28px 74px",
          boxSizing: "border-box",
          background:
            "linear-gradient(115deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.84) 45%, rgba(236,253,245,0.78) 100%)",
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            maskImage: "linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)",
            pointerEvents: "none",
          }} />
          <div
            className="web-floating-card"
            style={{
              position: "absolute",
              right: "max(32px, calc((100vw - 1180px) / 2 + 28px))",
              top: "72px",
              opacity: 0.92,
              transform: "rotate(6deg)",
            }}
          >
            <MiniCard card={DEMO_CARDS[0]} isActive presentation="static" />
          </div>
          <div
            className="web-floating-card web-floating-card-delay"
            style={{
              position: "absolute",
              right: "max(250px, calc((100vw - 1180px) / 2 + 248px))",
              bottom: "72px",
              opacity: 0.82,
              transform: "rotate(-8deg) scale(0.92)",
            }}
          >
            <MiniCard card={DEMO_CARDS[3]} isActive presentation="static" />
          </div>
          <div
            className="web-scan-beam"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "92px",
              background: "linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.16) 46%, transparent 100%)",
              pointerEvents: "none",
            }}
          />

          <div style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: "1180px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}>
            <div style={{ maxWidth: "680px" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "999px",
                background: "rgba(15,23,42,0.88)",
                color: "white",
                fontSize: "13px",
                fontWeight: 800,
                marginBottom: "20px",
                boxShadow: "0 12px 30px rgba(15,23,42,0.18)",
              }}>
                <Sparkles size={15} />
                Built for the after-meeting moment
              </div>
              <h1 style={{
                margin: 0,
                fontSize: "clamp(46px, 7vw, 82px)",
                lineHeight: 0.98,
                fontWeight: 900,
                color: "#0f172a",
                maxWidth: "720px",
              }}>
                {TAGLINES[0] || "Stop typing. Start scanning."}
              </h1>
              <p style={{
                margin: "22px 0 0",
                maxWidth: "560px",
                color: "#475569",
                fontSize: "clamp(18px, 2vw, 23px)",
                lineHeight: 1.45,
              }}>
                {t('home.subtitle')} Create a card once, then let every scan do the follow-up.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "30px" }}>
                <button
                  onClick={() => navigate("/register")}
                  style={{
                    border: "none",
                    background: "#0f172a",
                    color: "white",
                    borderRadius: "12px",
                    padding: "15px 20px",
                    fontSize: "16px",
                    fontWeight: 850,
                    cursor: "pointer",
                    boxShadow: "0 16px 38px rgba(15,23,42,0.22)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {t('home.getStarted')}
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => {
                    document.getElementById("web-scroll-story")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{
                    border: "1px solid rgba(15,23,42,0.16)",
                    background: "rgba(255,255,255,0.78)",
                    color: "#0f172a",
                    borderRadius: "12px",
                    padding: "15px 20px",
                    fontSize: "16px",
                    fontWeight: 850,
                    cursor: "pointer",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  Watch it change
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="web-scroll-story"
          style={{
            width: "100%",
            background: "#ffffff",
            boxSizing: "border-box",
            borderTop: "1px solid rgba(148,163,184,0.18)",
          }}
        >
          {WEB_STORY_STEPS.map((step, index) => (
            <WebStoryScene key={step.eyebrow} step={step} index={index} />
          ))}
        </section>

        {getActiveThemes().length > 0 && (
          <button
            onClick={() => navigate("/register")}
            style={{
              border: "none",
              width: "min(calc(100% - 56px), 760px)",
              background: "linear-gradient(135deg, #92400e 0%, #d97706 52%, #92400e 100%)",
              borderRadius: "16px",
              padding: "18px 22px",
              cursor: "pointer",
              boxShadow: "0 14px 32px rgba(217,119,6,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              textAlign: "left",
              margin: "0 auto 72px",
            }}
          >
            <span style={{ fontSize: "38px", lineHeight: 1, flexShrink: 0 }}>🏆</span>
            <span>
              <span style={{ display: "block", color: "#fef3c7", fontSize: "12px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
                {t('home.fifa.eyebrow')}
              </span>
              <span style={{ display: "block", color: "white", fontSize: "18px", fontWeight: 800 }}>
                {t('home.fifa.headline')}
              </span>
              <span style={{ display: "block", color: "rgba(255,255,255,0.78)", fontSize: "14px", marginTop: "4px" }}>
                {t('home.fifa.sub')}
              </span>
            </span>
          </button>
        )}

        <section style={{
          width: "100%",
          background: "#0f172a",
          color: "white",
          padding: "58px 28px",
          boxSizing: "border-box",
        }}>
          <div style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.05, fontWeight: 900 }}>
                Ready when the next conversation starts.
              </h2>
              <p style={{ margin: "12px 0 0", color: "#cbd5e1", fontSize: "18px", lineHeight: 1.45 }}>
                Build your first QR card and send it before the moment goes cold.
              </p>
            </div>
            <button
              onClick={() => navigate("/register")}
              style={{
                border: "none",
                background: "white",
                color: "#0f172a",
                borderRadius: "12px",
                padding: "15px 20px",
                fontSize: "16px",
                fontWeight: 850,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              Create a free card
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>
      {authMode && <WebAuthModal mode={authMode} />}
    </div>
  );
}

function WebAuthModal({ mode }: { mode: WebAuthMode }) {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const newPasswordRef = useRef<HTMLInputElement | null>(null);
  const urlToken = new URLSearchParams(search).get("token") || "";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [forgotStage, setForgotStage] = useState<"request" | "sent" | "reset" | "complete">(urlToken ? "reset" : "request");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const isPending = isLogin ? loginMutation.isPending : isRegister ? registerMutation.isPending : forgotSubmitting;

  const close = useCallback(() => navigate("/"), [navigate]);
  const switchMode = useCallback((nextMode: WebAuthMode) => {
    const pathByMode: Record<WebAuthMode, string> = {
      login: "/login",
      register: "/register",
      forgot: "/forgot-password",
    };
    navigate(pathByMode[nextMode]);
  }, [navigate]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (isForgot && forgotStage === "reset") {
        newPasswordRef.current?.focus();
      } else {
        emailRef.current?.focus();
      }
    }, 90);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, forgotStage, isForgot, mode]);

  useEffect(() => {
    if (mode !== "forgot") return;
    const tokenFromUrl = new URLSearchParams(search).get("token") || "";
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setForgotStage("reset");
    }
  }, [mode, search]);

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isForgot) return;

    if (!username || !password || (isRegister && !confirmPassword)) {
      toast({
        title: "Missing details",
        description: "Please fill in all fields before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(username)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (isRegister && password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please confirm the same password.",
        variant: "destructive",
      });
      return;
    }

    if (isLogin) {
      loginMutation.mutate({ username, password });
    } else {
      registerMutation.mutate({ username, password });
    }
  };

  const handleForgotRequest = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!forgotEmail) {
      toast({
        title: "Missing email",
        description: "Enter the email address for your QrMingle account.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(forgotEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setForgotSubmitting(true);
    try {
      await apiRequest("POST", "/api/forgot-password", { email: forgotEmail });
      setForgotStage("sent");
      toast({
        title: "Reset link requested",
        description: "If that account exists, a reset link has been sent.",
      });
    } catch (error) {
      console.error("Password reset request failed:", error);
      toast({
        title: "Could not request reset",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const tokenToUse = resetToken.trim();

    if (!tokenToUse) {
      toast({
        title: "Missing reset token",
        description: "Use the reset link from your email, or paste the reset token.",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword) {
      toast({
        title: "Missing password",
        description: "Enter a new password for your account.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      toast({
        title: "Passwords do not match",
        description: "Please confirm the same new password.",
        variant: "destructive",
      });
      return;
    }

    setForgotSubmitting(true);
    try {
      await apiRequest("POST", "/api/reset-password", {
        token: tokenToUse,
        newPassword,
      });
      setForgotStage("complete");
      toast({
        title: "Password reset complete",
        description: "You can now sign in with your new password.",
      });
    } catch (error) {
      console.error("Password reset failed:", error);
      toast({
        title: "Reset failed",
        description: "The reset link may be invalid or expired.",
        variant: "destructive",
      });
    } finally {
      setForgotSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #dbe4ef",
    borderRadius: "12px",
    padding: "14px 15px",
    color: "#0f172a",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
    background: isPending ? "#f8fafc" : "white",
  };

  const labelStyle: React.CSSProperties = {
    display: "grid",
    gap: "7px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 850,
  };

  const renderAuthContent = () => (
    <>
      <h2 style={{ margin: 0, color: "#0f172a", fontSize: "32px", lineHeight: 1.05, fontWeight: 900 }}>
        {isLogin ? "Welcome back" : "Create your account"}
      </h2>
      <p style={{ margin: "10px 0 26px", color: "#64748b", fontSize: "16px", lineHeight: 1.5 }}>
        {isLogin
          ? "Sign in to manage your cards and scans."
          : "Start with two free QR card profiles."}
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: "15px" }}>
          <label style={labelStyle}>
            Email
            <input
              ref={emailRef}
              type="email"
              placeholder="you@example.com"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isPending}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Password
            <input
              type="password"
              placeholder={isLogin ? "Enter your password" : "Choose a password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isPending}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              style={inputStyle}
            />
          </label>

          {isRegister && (
            <label style={labelStyle}>
              Confirm password
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isPending}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                style={inputStyle}
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{
            width: "100%",
            border: "none",
            borderRadius: "14px",
            padding: "15px 18px",
            marginTop: "22px",
            background: "linear-gradient(135deg, #4f46e5 0%, #14b8a6 100%)",
            color: "white",
            fontSize: "16px",
            fontWeight: 900,
            cursor: isPending ? "default" : "pointer",
            opacity: isPending ? 0.72 : 1,
            boxShadow: "0 16px 38px rgba(79,70,229,0.2)",
          }}
        >
          {isPending
            ? isLogin ? "Signing in..." : "Creating account..."
            : isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div style={{ marginTop: "18px", display: "grid", gap: "10px", textAlign: "center" }}>
        {isLogin && (
          <button
            type="button"
            onClick={() => switchMode("forgot")}
            style={{
              border: "none",
              background: "transparent",
              color: "#4f46e5",
              fontSize: "14px",
              fontWeight: 750,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Forgot password?
          </button>
        )}

        <button
          type="button"
          onClick={() => switchMode(isLogin ? "register" : "login")}
          style={{
            border: "none",
            background: "transparent",
            color: "#64748b",
            fontSize: "14px",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span style={{ color: "#0f172a", fontWeight: 850 }}>
            {isLogin ? "Sign Up" : "Sign In"}
          </span>
        </button>
      </div>
    </>
  );

  const renderForgotContent = () => {
    if (forgotStage === "complete") {
      return (
        <>
          <div style={{
            width: "54px",
            height: "54px",
            borderRadius: "16px",
            background: "#ecfdf5",
            color: "#047857",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
          }}>
            <CheckCircle2 size={28} />
          </div>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "32px", lineHeight: 1.05, fontWeight: 900 }}>
            Password reset complete
          </h2>
          <p style={{ margin: "10px 0 24px", color: "#64748b", fontSize: "16px", lineHeight: 1.5 }}>
            Your password has been updated. Sign in with the new password to continue.
          </p>
          <button
            type="button"
            onClick={() => switchMode("login")}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "14px",
              padding: "15px 18px",
              background: "linear-gradient(135deg, #4f46e5 0%, #14b8a6 100%)",
              color: "white",
              fontSize: "16px",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 16px 38px rgba(79,70,229,0.2)",
            }}
          >
            Go to Sign In
          </button>
        </>
      );
    }

    if (forgotStage === "reset") {
      return (
        <>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "32px", lineHeight: 1.05, fontWeight: 900 }}>
            Set a new password
          </h2>
          <p style={{ margin: "10px 0 22px", color: "#64748b", fontSize: "16px", lineHeight: 1.5 }}>
            Enter a new password for your QrMingle account.
          </p>

          <form onSubmit={handleResetPassword}>
            <div style={{ display: "grid", gap: "15px" }}>
              {urlToken ? (
                <div style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  border: "1px solid #bbf7d0",
                  background: "#f0fdf4",
                  color: "#047857",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  fontWeight: 750,
                }}>
                  <CheckCircle2 size={18} />
                  Reset link verified
                </div>
              ) : (
                <label style={labelStyle}>
                  Reset token
                  <input
                    type="text"
                    placeholder="Paste your reset token"
                    value={resetToken}
                    onChange={(event) => setResetToken(event.target.value)}
                    disabled={isPending}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    style={inputStyle}
                  />
                </label>
              )}

              <label style={labelStyle}>
                New password
                <input
                  ref={newPasswordRef}
                  type="password"
                  placeholder="Enter a new password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={isPending}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Confirm new password
                <input
                  type="password"
                  placeholder="Confirm your new password"
                  value={newPasswordConfirm}
                  onChange={(event) => setNewPasswordConfirm(event.target.value)}
                  disabled={isPending}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  style={inputStyle}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "14px",
                padding: "15px 18px",
                marginTop: "22px",
                background: "linear-gradient(135deg, #4f46e5 0%, #14b8a6 100%)",
                color: "white",
                fontSize: "16px",
                fontWeight: 900,
                cursor: isPending ? "default" : "pointer",
                opacity: isPending ? 0.72 : 1,
                boxShadow: "0 16px 38px rgba(79,70,229,0.2)",
              }}
            >
              {isPending ? "Resetting password..." : "Reset Password"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setForgotStage("request")}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              color: "#64748b",
              fontSize: "14px",
              cursor: "pointer",
              padding: "16px 0 0",
            }}
          >
            Request a new reset link
          </button>
        </>
      );
    }

    if (forgotStage === "sent") {
      return (
        <>
          <div style={{
            width: "54px",
            height: "54px",
            borderRadius: "16px",
            background: "#eef2ff",
            color: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
          }}>
            <Mail size={28} />
          </div>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "32px", lineHeight: 1.05, fontWeight: 900 }}>
            Check your email
          </h2>
          <p style={{ margin: "10px 0 22px", color: "#64748b", fontSize: "16px", lineHeight: 1.5 }}>
            If an account exists for <strong>{forgotEmail}</strong>, a reset link has been sent. It expires in 1 hour.
          </p>
          <div style={{
            display: "grid",
            gap: "10px",
          }}>
            <button
              type="button"
              onClick={() => switchMode("login")}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "14px",
                padding: "15px 18px",
                background: "linear-gradient(135deg, #4f46e5 0%, #14b8a6 100%)",
                color: "white",
                fontSize: "16px",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 16px 38px rgba(79,70,229,0.2)",
              }}
            >
              Back to Sign In
            </button>
            <button
              type="button"
              onClick={() => setForgotStage("reset")}
              style={{
                width: "100%",
                border: "1px solid #dbe4ef",
                borderRadius: "14px",
                padding: "14px 18px",
                background: "white",
                color: "#4f46e5",
                fontSize: "15px",
                fontWeight: 850,
                cursor: "pointer",
              }}
            >
              I have a reset token
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: "32px", lineHeight: 1.05, fontWeight: 900 }}>
          Reset your password
        </h2>
        <p style={{ margin: "10px 0 26px", color: "#64748b", fontSize: "16px", lineHeight: 1.5 }}>
          Enter your account email and we will send a secure reset link.
        </p>

        <form onSubmit={handleForgotRequest}>
          <label style={labelStyle}>
            Email
            <input
              ref={emailRef}
              type="email"
              placeholder="you@example.com"
              value={forgotEmail}
              onChange={(event) => setForgotEmail(event.target.value)}
              disabled={isPending}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "14px",
              padding: "15px 18px",
              marginTop: "22px",
              background: "linear-gradient(135deg, #4f46e5 0%, #14b8a6 100%)",
              color: "white",
              fontSize: "16px",
              fontWeight: 900,
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.72 : 1,
              boxShadow: "0 16px 38px rgba(79,70,229,0.2)",
            }}
          >
            {isPending ? "Sending reset link..." : "Send Reset Link"}
          </button>
        </form>

        <div style={{ marginTop: "18px", display: "grid", gap: "10px", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setForgotStage("reset")}
            style={{
              border: "none",
              background: "transparent",
              color: "#4f46e5",
              fontSize: "14px",
              fontWeight: 750,
              cursor: "pointer",
              padding: 0,
            }}
          >
            I already have a reset token
          </button>
          <button
            type="button"
            onClick={() => switchMode("login")}
            style={{
              border: "none",
              background: "transparent",
              color: "#64748b",
              fontSize: "14px",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Remembered it? <span style={{ color: "#0f172a", fontWeight: 850 }}>Sign In</span>
          </button>
        </div>
      </>
    );
  };

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.48)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="web-auth-dialog"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(960px, 100%)",
          maxHeight: "min(760px, calc(100dvh - 48px))",
          borderRadius: "24px",
          background: "white",
          boxShadow: "0 34px 110px rgba(15,23,42,0.36)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "minmax(280px, 0.9fr) minmax(320px, 1fr)",
          border: "1px solid rgba(255,255,255,0.5)",
        }}
      >
        <div className="web-auth-rail" style={{
          position: "relative",
          background:
            "linear-gradient(145deg, #0f172a 0%, #312e81 48%, #14b8a6 100%)",
          color: "white",
          padding: "34px",
          minHeight: "520px",
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            opacity: 0.42,
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "42px" }}>
              <WebLogo size={42} />
              <span style={{ fontSize: "26px", fontWeight: 900 }}>QrMingle</span>
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.02, fontWeight: 900 }}>
              {isForgot ? "Get back to your cards securely." : "Keep the conversation moving."}
            </h2>
            <p style={{ margin: "18px 0 0", color: "rgba(255,255,255,0.78)", fontSize: "17px", lineHeight: 1.55 }}>
              {isForgot
                ? "Request a reset link, set a new password, and return to QrMingle without leaving the portal."
                : "Create, scan, share, and manage your QR cards without leaving the landing experience."}
            </p>
          </div>

          <div style={{
            position: "relative",
            zIndex: 1,
            borderRadius: "18px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
            padding: "16px",
            boxShadow: "0 24px 60px rgba(15,23,42,0.2)",
          }}>
            <div style={{ color: "rgba(255,255,255,0.62)", fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>
              included
            </div>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px", fontSize: "14px", fontWeight: 750 }}>
              {isForgot ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Mail size={15} /> Email reset link</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><LockKeyhole size={15} /> Secure password update</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><LogIn size={15} /> Back to sign in</div>
                </>
              ) : (
                <>
                  <div>2 free profiles to start</div>
                  <div>AI profile-builder trial</div>
                  <div>Shareable public QR links</div>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{
          position: "relative",
          padding: "34px",
          boxSizing: "border-box",
          overflowY: "auto",
        }}>
          <button
            type="button"
            onClick={close}
            aria-label="Close auth modal"
            style={{
              position: "absolute",
              top: "18px",
              right: "18px",
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#475569",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>

          <div style={{ maxWidth: "430px", margin: "0 auto" }}>
            <div style={{
              display: "inline-flex",
              padding: "5px",
              borderRadius: "14px",
              background: "#f1f5f9",
              marginBottom: "26px",
              gap: "4px",
            }}>
              {([
                { key: "login" as const, label: "Sign In", Icon: LogIn },
                { key: "register" as const, label: "Sign Up", Icon: UserPlus },
                { key: "forgot" as const, label: "Reset", Icon: KeyRound },
              ]).map(({ key, label, Icon }) => {
                const active = mode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchMode(key)}
                    style={{
                      border: "none",
                      borderRadius: "10px",
                      padding: "9px 12px",
                      background: active ? "white" : "transparent",
                      color: active ? "#0f172a" : "#64748b",
                      fontSize: "14px",
                      fontWeight: 850,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      boxShadow: active ? "0 8px 20px rgba(15,23,42,0.08)" : "none",
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </div>

            {isForgot ? renderForgotContent() : renderAuthContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function WebStoryScene({ step, index }: { step: WebStoryStep; index: number }) {
  const StepIcon = step.Icon;
  const isAlt = index % 2 === 1;

  return (
    <section style={{
      width: "100%",
      background: isAlt ? "#f8fafc" : "#ffffff",
      borderTop: index === 0 ? "none" : "1px solid rgba(148,163,184,0.14)",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "1180px",
        minHeight: "min(780px, 88vh)",
        margin: "0 auto",
        padding: "86px 28px",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: "56px",
        flexWrap: "wrap",
      }}>
        <div style={{
          flex: "1 1 360px",
          minWidth: 0,
          borderLeft: `5px solid ${step.accent}`,
          padding: "30px 0 30px 30px",
        }}>
          <div style={{
            color: step.accent,
            fontSize: "13px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "1.4px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: step.accent,
              color: "white",
              boxShadow: "0 14px 34px rgba(15,23,42,0.14)",
            }}>
              <StepIcon size={22} />
            </span>
            {String(index + 1).padStart(2, "0")} / {step.eyebrow}
          </div>

          <h2 style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "clamp(38px, 5vw, 68px)",
            lineHeight: 0.98,
            fontWeight: 900,
            maxWidth: "620px",
          }}>
            {step.title}
          </h2>
          <p style={{
            margin: "24px 0 0",
            color: "#64748b",
            fontSize: "clamp(18px, 2vw, 24px)",
            lineHeight: 1.5,
            maxWidth: "610px",
          }}>
            {step.body}
          </p>
        </div>

        <WebStoryVisual activeIndex={index} />
      </div>
    </section>
  );
}

function WebLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="512" height="512" rx="256" fill="#6366f1"/>
      <g opacity="0.95">
        <rect x="144" y="144" width="80" height="80" rx="16" fill="white"/>
        <rect x="160" y="160" width="48" height="48" rx="8" fill="rgba(99,102,241,0.35)"/>
        <rect x="288" y="144" width="80" height="80" rx="16" fill="white"/>
        <rect x="304" y="160" width="48" height="48" rx="8" fill="rgba(99,102,241,0.35)"/>
        <rect x="144" y="288" width="80" height="80" rx="16" fill="white"/>
        <rect x="160" y="304" width="48" height="48" rx="8" fill="rgba(99,102,241,0.35)"/>
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
  );
}

function WebStoryVisual({ activeIndex }: { activeIndex: number }) {
  const step = WEB_STORY_STEPS[activeIndex] ?? WEB_STORY_STEPS[0];
  const card = activeIndex === 2 ? DEMO_CARDS[3] : DEMO_CARDS[activeIndex] ?? DEMO_CARDS[0];
  const StepIcon = step.Icon;

  return (
    <div style={{
      flex: "1 1 430px",
      minWidth: 0,
      position: "relative",
      alignSelf: "center",
      minHeight: "620px",
      borderRadius: "30px",
      background: step.panel,
      border: "1px solid rgba(148,163,184,0.28)",
      boxShadow: "0 30px 80px rgba(15,23,42,0.14)",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
        opacity: 0.72,
      }} />

      <div style={{
        position: "relative",
        minHeight: "620px",
        padding: "34px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "22px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "18px",
        }}>
          <div>
            <div style={{ color: step.accent, fontSize: "13px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
              Live preview
            </div>
            <div style={{ color: "#0f172a", fontSize: "28px", lineHeight: 1.08, fontWeight: 900 }}>
              {step.eyebrow}
            </div>
          </div>
          <div className="web-story-qr-pulse" style={{
            width: "54px",
            height: "54px",
            borderRadius: "16px",
            background: step.accent,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 16px 34px rgba(15,23,42,0.14)",
          }}>
            <StepIcon size={27} />
          </div>
        </div>

        <div style={{
          position: "relative",
          minHeight: "392px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {activeIndex === 0 && (
            <>
              <div className="web-story-float" style={{
                position: "absolute",
                left: "4px",
                top: "28px",
                width: "260px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(148,163,184,0.24)",
                boxShadow: "0 22px 52px rgba(15,23,42,0.13)",
                padding: "18px",
                transform: "rotate(-4deg)",
                zIndex: 1,
              }}>
                <div style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>
                  paper business card
                </div>
                <div style={{ marginTop: "18px", color: "#0f172a", fontSize: "24px", lineHeight: 1, fontWeight: 900 }}>Sarah Chen</div>
                <div style={{ marginTop: "8px", color: "#64748b", fontSize: "13px", fontWeight: 700 }}>Sr. Engineer, Meta</div>
                <div style={{ marginTop: "18px", display: "grid", gap: "8px" }}>
                  {["linkedin.com/in/sarahchen", "github.com/sarahchen", "sarah@meta.com"].map((item) => (
                    <div key={item} style={{ height: "9px", borderRadius: "999px", background: "rgba(100,116,139,0.18)", width: item.length > 17 ? "90%" : "70%" }} />
                  ))}
                </div>
              </div>
              <div className="web-scan-beam-tight" style={{
                position: "absolute",
                left: "0",
                top: "56px",
                width: "292px",
                height: "82px",
                borderRadius: "999px",
                background: "linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.26) 48%, transparent 100%)",
                zIndex: 3,
              }} />
              <div style={{
                position: "absolute",
                right: "28px",
                bottom: "12px",
                zIndex: 4,
              }}>
                <MiniCard card={card} isActive presentation="static" />
              </div>
              <div style={{
                position: "absolute",
                left: "210px",
                top: "188px",
                color: step.accent,
                fontSize: "13px",
                fontWeight: 900,
                padding: "9px 12px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(148,163,184,0.24)",
                boxShadow: "0 14px 30px rgba(15,23,42,0.1)",
                zIndex: 5,
              }}>
                Extracted into a card
              </div>
            </>
          )}

          {activeIndex === 1 && (
            <>
              <div className="web-story-card-enter" style={{
                position: "absolute",
                left: "20px",
                bottom: "80px",
                zIndex: 2,
              }}>
                <MiniCard card={card} isActive presentation="static" />
              </div>
              <div className="web-story-qr-pulse" style={{
                position: "absolute",
                right: "30px",
                top: "74px",
                width: "176px",
                borderRadius: "24px",
                background: "rgba(255,255,255,0.94)",
                border: "1px solid rgba(148,163,184,0.24)",
                boxShadow: "0 24px 58px rgba(15,23,42,0.16)",
                padding: "16px",
                zIndex: 6,
              }}>
                <QRCodeSVG value={`https://qrmingle.com/p/${card.qrSlug}`} size={116} fgColor={step.accent} />
                <div style={{ color: "#0f172a", fontSize: "13px", fontWeight: 900, marginTop: "12px" }}>Shareable QR link</div>
              </div>
              <div style={{
                position: "absolute",
                left: "156px",
                top: "34px",
                width: "270px",
                height: "44px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(148,163,184,0.22)",
                boxShadow: "0 16px 34px rgba(15,23,42,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                color: "#334155",
                fontSize: "13px",
                fontWeight: 850,
                zIndex: 5,
              }}>
                <QrCode size={16} color={step.accent} />
                qrmingle.com/p/{card.qrSlug}
              </div>
              <div style={{
                position: "absolute",
                left: "28px",
                right: "28px",
                bottom: "10px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(148,163,184,0.24)",
                boxShadow: "0 22px 50px rgba(15,23,42,0.14)",
                padding: "10px 12px",
                zIndex: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}>
                {["Messages", "Email", "Resume", "Event badge"].map((item) => (
                  <div key={item} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    padding: "8px 10px",
                    color: "#334155",
                    fontSize: "12px",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}>
                    <Share2 size={15} color={step.accent} />
                    {item}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeIndex === 2 && (
            <>
              <div className="web-story-ai-glow" style={{
                position: "absolute",
                left: "20px",
                top: "54px",
                width: "238px",
                borderRadius: "22px",
                background: "rgba(255,255,255,0.94)",
                border: "1px solid rgba(148,163,184,0.24)",
                boxShadow: "0 24px 58px rgba(15,23,42,0.14)",
                padding: "16px",
                boxSizing: "border-box",
                zIndex: 6,
              }}>
                <div style={{ color: step.accent, fontSize: "11px", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                  AI prompt
                </div>
                <div style={{ color: "#0f172a", fontSize: "14px", lineHeight: 1.42, fontWeight: 750 }}>
                  "Create a food blogger card for Priya Sharma with Instagram, recipes, and a warm pink style."
                  <span className="web-story-cursor" />
                </div>
                <div style={{ marginTop: "14px", display: "grid", gap: "7px" }}>
                  {["Name found", "Role drafted", "Links organized", "Style selected"].map((item) => (
                    <div key={item} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#475569",
                      fontSize: "11px",
                      fontWeight: 800,
                    }}>
                      <Sparkles size={14} color={step.accent} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                position: "absolute",
                right: "18px",
                bottom: "22px",
                zIndex: 4,
                transform: "scale(0.94)",
                transformOrigin: "bottom right",
              }}>
                <div className="web-story-card-enter">
                  <MiniCard card={card} isActive presentation="static" />
                </div>
              </div>
              <div style={{
                position: "absolute",
                right: "86px",
                top: "62px",
                color: step.accent,
                fontSize: "13px",
                fontWeight: 900,
                padding: "10px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(148,163,184,0.24)",
                boxShadow: "0 14px 30px rgba(15,23,42,0.1)",
                zIndex: 5,
              }}>
                Card generated
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          {WEB_STORY_STEPS.map((item, index) => (
            <div key={item.eyebrow} style={{
              width: activeIndex === index ? "34px" : "9px",
              height: "9px",
              borderRadius: "999px",
              background: activeIndex === index ? item.accent : "rgba(100,116,139,0.22)",
              transition: "all 220ms ease",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NativeHome() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(true);
  const [activeCardSlot, setActiveCardSlot] = useState(0);
  const TAGLINES = t('home.taglines', { returnObjects: true }) as string[];

  useEffect(() => {
    if (user) navigate("/profiles");
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineVisible(false);
      setTimeout(() => {
        setTaglineIndex((i: number) => (i + 1) % TAGLINES.length);
        setTaglineVisible(true);
      }, 400);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const carouselRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);

  const updateActiveCard = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;

    const containerRect = el.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    let closestSlot = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    el.querySelectorAll<HTMLElement>("[data-demo-card-slot]").forEach((cardEl) => {
      const rect = cardEl.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - centerX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSlot = Number(cardEl.dataset.demoCardSlot ?? 0);
      }
    });

    setActiveCardSlot((current) => (current === closestSlot ? current : closestSlot));
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    let frameId: number;
    let resumeTimer: ReturnType<typeof setTimeout>;
    const initialUpdateTimer = window.setTimeout(updateActiveCard, 0);

    const tick = () => {
      if (!pausedRef.current) {
        el.scrollLeft += 0.38;
        // Seamless loop — when we've scrolled through the first copy, jump back
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft -= el.scrollWidth / 2;
        }
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    const pause = () => {
      pausedRef.current = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { pausedRef.current = false; }, 2500);
    };

    const onScroll = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateActiveCard();
      });
    };

    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("mousedown", pause);
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActiveCard);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(resumeTimer);
      clearTimeout(initialUpdateTimer);
      if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("mousedown", pause);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateActiveCard);
    };
  }, [updateActiveCard]);

  if (user) return null;

  return (
    <div style={{
      height: "100dvh",
      minHeight: "100dvh",
      background: "linear-gradient(170deg, #0f0c29 0%, #1e1b4b 30%, #312e81 60%, #4338ca 85%, #6366f1 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100vw",
      maxWidth: "100vw",
      paddingLeft: "24px",
      paddingRight: "24px",
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
      position: "relative",
      overflowX: "hidden",
      overflowY: "hidden",
      boxSizing: "border-box",
    }}>

      {/* Background glow orbs */}
      <div style={{
        position: "absolute", top: "8%", left: "-25%",
        width: "340px", height: "340px", borderRadius: "50%",
        background: "rgba(99,102,241,0.22)", filter: "blur(70px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "18%", right: "-20%",
        width: "280px", height: "280px", borderRadius: "50%",
        background: "rgba(139,92,246,0.18)", filter: "blur(60px)", pointerEvents: "none",
      }} />

      {/* ── Logo ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        paddingTop: "clamp(28px, 5dvh, 46px)", marginBottom: "10px",
        flexShrink: 0,
      }}>
        <svg width="40" height="40" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="512" height="512" rx="256" fill="rgba(255,255,255,0.18)"/>
          <g opacity="0.95">
            <rect x="144" y="144" width="80" height="80" rx="16" fill="white"/>
            <rect x="160" y="160" width="48" height="48" rx="8" fill="rgba(255,255,255,0.3)"/>
            <rect x="288" y="144" width="80" height="80" rx="16" fill="white"/>
            <rect x="304" y="160" width="48" height="48" rx="8" fill="rgba(255,255,255,0.3)"/>
            <rect x="144" y="288" width="80" height="80" rx="16" fill="white"/>
            <rect x="160" y="304" width="48" height="48" rx="8" fill="rgba(255,255,255,0.3)"/>
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
        <span style={{ color: "white", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>QrMingle</span>
      </div>

      {/* ── Rotating tagline ── */}
      <div style={{ textAlign: "center", marginBottom: "10px", minHeight: "74px", display: "flex", flexDirection: "column", justifyContent: "center", flexShrink: 0 }}>
        <h1 style={{
          color: "white", fontSize: "24px", fontWeight: 800,
          lineHeight: 1.25, margin: 0, letterSpacing: "-0.5px",
          opacity: taglineVisible ? 1 : 0,
          transform: taglineVisible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}>
          {TAGLINES[taglineIndex]}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.58)", fontSize: "14px", marginTop: "8px", lineHeight: 1.5 }}>
          {t('home.subtitle')}
        </p>
      </div>

      {/* ── Scrollable card carousel — auto-scrolls slowly, pauses on touch ── */}
      <div
        ref={carouselRef}
        className="welcome-scroll"
        style={{
          width: "100vw",
          maxWidth: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch" as any,
          display: "flex",
          gap: "18px",
          paddingTop: "24px",
          paddingBottom: "24px",
          paddingLeft: "max(24px, calc((100vw - 272px) / 2))",
          paddingRight: "max(24px, calc((100vw - 272px) / 2))",
          msOverflowStyle: "none" as any,
          scrollbarWidth: "none" as any,
          scrollSnapType: "x proximity",
          flex: "0 1 min(34dvh, 340px)",
          minHeight: "282px",
          alignItems: "center",
        }}
      >
        {/* Cards duplicated for seamless infinite loop */}
        {[...DEMO_CARDS, ...DEMO_CARDS].map((card, i) => (
          <div
            key={`${card.qrSlug}-${i}`}
            data-demo-card-slot={i}
            style={{
              flexShrink: 0,
              scrollSnapAlign: "center",
              paddingTop: "6px",
              paddingBottom: "6px",
            }}
          >
            <MiniCard card={card} isActive={i === activeCardSlot} />
          </div>
        ))}
      </div>

      {/* Scroll hint dots */}
      <div style={{ display: "flex", gap: "5px", marginTop: "8px", marginBottom: "14px", flexShrink: 0 }}>
        {DEMO_CARDS.map((card, i) => (
          <div key={i} style={{
            width: activeCardSlot % DEMO_CARDS.length === i ? "20px" : "5px", height: "5px", borderRadius: "99px",
            background: activeCardSlot % DEMO_CARDS.length === i ? "white" : "rgba(255,255,255,0.3)",
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* ── World Cup banner (shown only when a theme is active) ── */}
      {getActiveThemes().length > 0 && (
        <div
          onClick={() => navigate("/register")}
          style={{
            width: "100%", maxWidth: "380px",
            background: "linear-gradient(135deg, #92400e 0%, #d97706 50%, #92400e 100%)",
            borderRadius: "18px",
            padding: "18px 20px",
            marginBottom: "18px",
            flexShrink: 0,
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(217,119,6,0.45)",
            display: "flex", alignItems: "center", gap: "14px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <div style={{ fontSize: "42px", lineHeight: 1, flexShrink: 0 }}>🏆</div>
          <div>
            <div style={{ color: "#fef3c7", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
              {t('home.fifa.eyebrow')}
            </div>
            <div style={{ color: "white", fontSize: "16px", fontWeight: 700, lineHeight: 1.3 }}>
              {t('home.fifa.headline')}
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", marginTop: "4px" }}>
              {t('home.fifa.sub')}
            </div>
          </div>
        </div>
      )}

      {/* ── CTA section ── */}
      <div style={{
        width: "100%", maxWidth: "380px",
        textAlign: "center",
        paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate("/register")}
          style={{
            width: "100%", background: "white", color: "#1e293b",
            border: "none", borderRadius: "16px", padding: "18px",
            fontSize: "17px", fontWeight: 700, cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            marginBottom: "18px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {t('home.getStarted')}
        </button>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px" }}>
          {t('home.alreadyHaveAccount')}{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "white", fontWeight: 700, cursor: "pointer" }}
          >
            {t('home.signIn')}
          </span>
        </p>
      </div>
    </div>
  );
}
