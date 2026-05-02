import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { Linkedin, Mail, Phone, Globe, Instagram, Github, type LucideIcon } from "lucide-react";
import { getActiveThemes } from "@/data/themes";

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

function MiniCard({ card }: { card: DemoCard }) {
  const { badge, displayName, title, accent, gradient, initial, qrSlug, links } = card;
  return (
    <div style={{
      flexShrink: 0,
      width: "272px",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.1)",
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

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user) navigate("/profiles");
  }, [user, navigate]);

  if (user) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(170deg, #0f0c29 0%, #1e1b4b 30%, #312e81 60%, #4338ca 85%, #6366f1 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingLeft: "24px",
      paddingRight: "24px",
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
      position: "relative",
      overflow: "hidden",
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
        paddingTop: "52px", marginBottom: "24px",
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

      {/* ── Tagline above carousel ── */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{
          color: "white", fontSize: "24px", fontWeight: 800,
          lineHeight: 1.25, margin: 0, letterSpacing: "-0.5px",
        }}>
          A card for every version of you.
        </h1>
        <p style={{ color: "rgba(255,255,255,0.58)", fontSize: "14px", marginTop: "8px", lineHeight: 1.5 }}>
          One QR scan. No app needed for the receiver.
        </p>
      </div>

      {/* ── Scrollable card carousel ── */}
      <div
        className="welcome-scroll"
        style={{
          width: "100vw",
          marginLeft: "-24px",
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch" as any,
          scrollSnapType: "x mandatory",
          display: "flex",
          gap: "14px",
          padding: "10px 24px 14px",
          msOverflowStyle: "none" as any,
          scrollbarWidth: "none" as any,
          flex: 1,
          alignItems: "center",
        }}
      >
        {DEMO_CARDS.map((card) => (
          <div key={card.qrSlug} style={{ scrollSnapAlign: "start", flexShrink: 0 }}>
            <MiniCard card={card} />
          </div>
        ))}
      </div>

      {/* Scroll hint dots */}
      <div style={{ display: "flex", gap: "5px", marginTop: "12px", marginBottom: "20px" }}>
        {DEMO_CARDS.map((card, i) => (
          <div key={i} style={{
            width: i === 0 ? "20px" : "5px", height: "5px", borderRadius: "99px",
            background: i === 0 ? "white" : "rgba(255,255,255,0.3)",
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
            marginBottom: "20px",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(217,119,6,0.45)",
            display: "flex", alignItems: "center", gap: "14px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <div style={{ fontSize: "42px", lineHeight: 1, flexShrink: 0 }}>🏆</div>
          <div>
            <div style={{ color: "#fef3c7", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
              FIFA World Cup 2026
            </div>
            <div style={{ color: "white", fontSize: "16px", fontWeight: 700, lineHeight: 1.3 }}>
              Rep your team. Share your card.
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", marginTop: "4px" }}>
              Create a free fan card in seconds →
            </div>
          </div>
        </div>
      )}

      {/* ── CTA section ── */}
      <div style={{
        width: "100%", maxWidth: "380px",
        textAlign: "center",
        paddingBottom: "44px",
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
          Get Started — It's Free
        </button>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "white", fontWeight: 700, cursor: "pointer" }}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
