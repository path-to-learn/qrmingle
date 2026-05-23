import { Check, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

const accent = "var(--app-accent, #6366f1)";

const AT_A_GLANCE = [
  "We do not sell your data.",
  "QrMingle does not run ads or ad-network tracking.",
  "People who scan your QR code do not need an account.",
  "Camera and photo access are used only when you choose those actions.",
  "You can delete your account from Settings.",
];

const SECTIONS = [
  {
    title: "What you add to QrMingle",
    body:
      "When you create an account, you provide an email address and password. When you create cards, you may add your name, title, bio, profile photo, background image, QR styling, and social or contact links.",
  },
  {
    title: "Your public card",
    body:
      "Anything you put on a card is meant to be shared. Anyone with your QR code or public card link can view that card, so only add information you are comfortable sharing publicly.",
  },
  {
    title: "Business-card scanning and AI assist",
    body:
      "If you use the Scan tab or AI card-builder tools, the selected image or text prompt is sent to QrMingle's server and to an AI service provider so the app can extract or draft card details. QrMingle does not use those images or prompts for advertising, and the scanned business-card image is not saved as a profile image unless you choose to create or edit a card with that information.",
  },
  {
    title: "Profile photos and images",
    body:
      "Profile photos and card images are stored so they can be shown on your card. QrMingle does not use them for facial recognition or advertising.",
  },
  {
    title: "Analytics",
    body:
      "When someone opens one of your public cards, QrMingle records scan activity such as date and time, approximate location based on IP address, browser, and device type. This powers scan counts and Premium analytics. Scan analytics are visible to the card owner, not publicly displayed on the card.",
  },
  {
    title: "Reviews and support",
    body:
      "If you submit a review, we collect the name, optional title, rating, and review text you provide. Approved reviews may be shown publicly. If you contact support, we use your email and message only to respond and troubleshoot.",
  },
  {
    title: "Payments and purchases",
    body:
      "Premium purchases are processed by Apple App Store in the iOS app and may be processed by Stripe on the web. QrMingle stores purchase status so Premium features can be unlocked, but we do not store your full card number.",
  },
  {
    title: "Passwords and sessions",
    body:
      "Passwords are stored using one-way hashing, not plain text. When you sign in, QrMingle uses a session cookie or session identifier to keep you logged in. Sessions are used for authentication, not advertising.",
  },
  {
    title: "What we do not do",
    items: [
      "Sell your personal data",
      "Show ads in the app",
      "Use ad-network tracking",
      "Access your contacts, microphone, or location in the background",
      "Post or share your private account information without your action",
    ],
  },
  {
    title: "Services we use to run the app",
    items: [
      "Neon/PostgreSQL for account, card, analytics, review, and session data",
      "AI service provider for card-assist and business-card extraction requests",
      "SendGrid for transactional email such as password reset",
      "Apple App Store and Stripe for purchase processing, depending on platform",
    ],
  },
  {
    title: "Deleting your account",
    body:
      "You can delete your account from Settings. Deletion removes your account, profile cards, QR codes, scan history, and contact messages from QrMingle. This action is intended to be permanent.",
  },
  {
    title: "Children",
    body:
      "QrMingle is not intended for children under 13. If you believe a child has created an account, contact support so we can review and remove it.",
  },
  {
    title: "Changes to this policy",
    body:
      "If this policy changes in a meaningful way, we will update this page. The date at the bottom reflects the latest version.",
  },
];

export default function Privacy() {
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
          <LockKeyhole size={26} />
        </div>
        <h1 style={{ fontSize: "26px", lineHeight: 1.15, fontWeight: 800, margin: "0 0 8px" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: "14px", lineHeight: 1.55, opacity: 0.9, margin: 0, maxWidth: "580px" }}>
          A plain-language summary of what QrMingle collects, how the app uses it, and the choices you have.
        </p>
      </section>

      <section style={{
        background: "white",
        border: "1px solid #dbeafe",
        borderRadius: "18px",
        padding: "18px",
        marginBottom: "18px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "rgba(16,185,129,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <ShieldCheck size={20} style={{ color: "#059669" }} />
          </div>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            At a glance
          </h2>
        </div>
        <div style={{ display: "grid", gap: "9px" }}>
          {AT_A_GLANCE.map((item) => (
            <div key={item} style={{
              display: "grid",
              gridTemplateColumns: "20px minmax(0, 1fr)",
              gap: "9px",
              alignItems: "start",
              color: "#166534",
              fontSize: "14px",
              lineHeight: 1.45,
            }}>
              <Check size={16} style={{ color: "#16a34a", marginTop: "2px" }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        background: "white",
        border: "1px solid #eef2f7",
        borderRadius: "18px",
        padding: "18px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}>
        {SECTIONS.map((section, index) => (
          <div
            key={section.title}
            style={{
              paddingBottom: index === SECTIONS.length - 1 ? 0 : "18px",
              marginBottom: index === SECTIONS.length - 1 ? 0 : "18px",
              borderBottom: index === SECTIONS.length - 1 ? "none" : "1px solid #f1f5f9",
            }}
          >
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
              {section.title}
            </h2>
            {section.body && (
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.65, margin: 0 }}>
                {section.body}
              </p>
            )}
            {section.items && (
              <ul style={{ margin: "4px 0 0", paddingLeft: "18px" }}>
                {section.items.map((item) => (
                  <li key={item} style={{ fontSize: "14px", color: "#475569", lineHeight: 1.7 }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "16px",
        display: "grid",
        gridTemplateColumns: "42px minmax(0, 1fr)",
        gap: "12px",
        alignItems: "start",
        marginTop: "18px",
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
          <Mail size={20} style={{ color: accent }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ color: "#0f172a", fontSize: "15px", fontWeight: 800, margin: "0 0 5px" }}>
            Contact
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
            Questions or data requests: <a href="mailto:support@qrmingle.com" style={{ color: accent, fontWeight: 700 }}>support@qrmingle.com</a>
          </p>
        </div>
      </section>

      <div style={{
        borderTop: "1px solid #e2e8f0",
        paddingTop: "14px",
        marginTop: "18px",
        fontSize: "13px",
        color: "#94a3b8",
      }}>
        Last updated: May 23, 2026
      </div>
    </main>
  );
}
