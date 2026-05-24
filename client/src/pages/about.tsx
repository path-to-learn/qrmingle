import {
  BarChart3,
  CreditCard,
  Heart,
  Mail,
  QrCode,
  ScanLine,
  Share2,
} from "lucide-react";

const accent = "var(--app-accent, #6366f1)";

const FEATURES = [
  {
    icon: CreditCard,
    title: "Digital cards",
    body: "Create polished cards for work, events, personal networking, and community profiles.",
  },
  {
    icon: QrCode,
    title: "QR sharing",
    body: "Share a card with a QR code or link. The person receiving it does not need the app.",
  },
  {
    icon: ScanLine,
    title: "Card scanning",
    body: "Turn a physical business card or contact-card photo into a draft digital card.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    body: "See card engagement so you can understand which cards are getting attention.",
  },
];

export default function AboutPage() {
  const supportEmail = "support@qrmingle.com";
  const appVersion = "1.0.0";

  return (
    <main style={{
      maxWidth: "760px",
      margin: "0 auto",
      padding: "24px 16px calc(104px + env(safe-area-inset-bottom))",
      overflowX: "hidden",
    }}>
      <section style={{
        background: `linear-gradient(135deg, ${accent}, #8b5cf6)`,
        borderRadius: "22px",
        padding: "28px 22px",
        color: "white",
        marginBottom: "18px",
        boxShadow: "0 18px 42px rgba(99,102,241,0.22)",
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
        }}>
          <Share2 size={26} />
        </div>
        <h1 style={{ fontSize: "26px", lineHeight: 1.15, fontWeight: 800, margin: "0 0 8px" }}>
          About QrMingle
        </h1>
        <p style={{ fontSize: "14px", lineHeight: 1.55, opacity: 0.92, margin: 0, maxWidth: "580px" }}>
          QrMingle helps you create digital contact cards that can be shared instantly with a QR code or link.
        </p>
      </section>

      <section style={{
        background: "white",
        border: "1px solid #eef2f7",
        borderRadius: "18px",
        padding: "18px",
        marginBottom: "18px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}>
        <p style={{ color: "#334155", fontSize: "15px", lineHeight: 1.65, margin: 0 }}>
          Create cards for work, events, personal networking, or fan and community profiles, then share them without asking anyone to install an app.
        </p>
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "10px",
        marginBottom: "18px",
      }}>
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} style={{
            background: "white",
            border: "1px solid #eef2f7",
            borderRadius: "16px",
            padding: "14px",
            boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
            minWidth: 0,
          }}>
            <Icon size={22} style={{ color: accent, marginBottom: "10px" }} />
            <div style={{ color: "#0f172a", fontSize: "14px", fontWeight: 800, marginBottom: "5px" }}>{title}</div>
            <div style={{ color: "#64748b", fontSize: "12px", lineHeight: 1.45 }}>{body}</div>
          </div>
        ))}
      </section>

      <section style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "16px",
        marginBottom: "18px",
        display: "grid",
        gap: "12px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "42px minmax(0, 1fr)",
          gap: "12px",
          alignItems: "start",
        }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(15,23,42,0.08)",
          }}>
            <Heart size={20} style={{ color: accent }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ color: "#0f172a", fontSize: "15px", fontWeight: 800, margin: "0 0 5px" }}>
              Built by Prashant Dathwal
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
              Built with love <span aria-label="heart" style={{ color: "#ef4444", fontWeight: 800 }}>♥</span> from Sunnyvale, CA.
            </p>
          </div>
        </div>
      </section>

      <section style={{
        background: "white",
        border: "1px solid #eef2f7",
        borderRadius: "18px",
        padding: "16px",
        display: "grid",
        gridTemplateColumns: "42px minmax(0, 1fr)",
        gap: "12px",
        alignItems: "start",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}>
        <div style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Mail size={20} style={{ color: accent }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ color: "#0f172a", fontSize: "15px", fontWeight: 800, margin: "0 0 5px" }}>
            Support
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
            Email <a href={`mailto:${supportEmail}`} style={{ color: accent, fontWeight: 700 }}>{supportEmail}</a> for product support or account questions.
          </p>
          <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.4, margin: "10px 0 0" }}>
            Version {appVersion}. Copyright © 2026 QrMingle. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
