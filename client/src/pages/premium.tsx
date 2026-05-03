import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Crown, Check, Lock, Sparkles, BarChart2, QrCode, Users, Zap } from "lucide-react";

const FREE_FEATURES = [
  "2 digital profiles",
  "Basic QR code style",
  "Total scan count",
  "FIFA fan cards (always free)",
  "2 AI card assists (promo)",
  "All social link types",
  "Shareable public profile page",
];

const PREMIUM_FEATURES = [
  { text: "Up to 5 profiles", icon: Users },
  { text: "All premium QR styles (bordered, gradient, rounded, shadow)", icon: QrCode },
  { text: "Full analytics — charts, device & country breakdown", icon: BarChart2 },
  { text: "Unlimited AI card builder assists", icon: Sparkles },
  { text: "Priority support", icon: Zap },
];

export default function Premium() {
  const [, navigate] = useLocation();
  const { user, isEffectivelyPremium } = useAuth();
  const isPremium = isEffectivelyPremium();

  if (isPremium) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "20px", padding: "32px 24px", textAlign: "center", color: "white", marginBottom: "24px" }}>
          <Crown size={40} style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>You're on Premium</div>
          <div style={{ fontSize: "14px", opacity: 0.85 }}>All features are unlocked. Enjoy!</div>
        </div>
        <button
          onClick={() => navigate("/profiles")}
          style={{ width: "100%", padding: "14px", background: "#6366f1", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
        >
          Go to My Cards
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "20px", padding: "28px 24px", textAlign: "center", color: "white", marginBottom: "20px" }}>
        <Crown size={36} style={{ margin: "0 auto 10px" }} />
        <div style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>QrMingle Premium</div>
        <div style={{ fontSize: "14px", opacity: 0.85 }}>More profiles, full analytics, unlimited AI</div>
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "12px" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "10px 20px" }}>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>$2.99</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>per month</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: "10px", padding: "10px 20px", border: "1px solid rgba(255,255,255,0.4)" }}>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>$14.99</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>per year · save 58%</div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        {/* Free column */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Free</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {FREE_FEATURES.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <Check size={13} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "12px", color: "#475569", lineHeight: 1.4 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium column */}
        <div style={{ background: "#faf5ff", border: "2px solid #6366f1", borderRadius: "14px", padding: "16px", position: "relative" }}>
          <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#6366f1", color: "white", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", whiteSpace: "nowrap" }}>
            PREMIUM
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#6366f1", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Premium</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "11px", color: "#7c3aed", fontStyle: "italic", marginBottom: "2px" }}>Everything in Free, plus:</div>
            {PREMIUM_FEATURES.map(({ text, icon: Icon }) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <Icon size={13} style={{ color: "#6366f1", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "12px", color: "#3730a3", lineHeight: 1.4, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
        <Lock size={20} style={{ color: "#94a3b8", margin: "0 auto 8px" }} />
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>In-app purchase coming soon</div>
        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
          Premium upgrades will be available via Apple In-App Purchase and Stripe shortly. Stay tuned!
        </div>
        <button
          onClick={() => navigate("/profiles")}
          style={{ width: "100%", padding: "13px", background: "#1e293b", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
        >
          Back to My Cards
        </button>
      </div>
    </div>
  );
}
