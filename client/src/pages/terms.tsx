import {
  AlertTriangle,
  CreditCard,
  FileText,
  Mail,
  ShieldCheck,
} from "lucide-react";

const accent = "var(--app-accent, #6366f1)";

const SUMMARY = [
  "Use QrMingle to create, customize, scan, and share digital contact cards.",
  "Only add card information and images you have the right to share.",
  "Cards and QR links are meant to be public when you share them.",
  "Card scanning and AI assist can make mistakes, so review results before saving or sharing.",
  "Premium purchases are handled by the App Store on iOS.",
];

const SECTIONS = [
  {
    title: "Using QrMingle",
    body:
      "QrMingle helps you create digital contact cards, customize QR codes, share public card links, scan business cards into drafts, and view card engagement. You agree to use the app only for lawful, respectful, and non-misleading purposes.",
  },
  {
    title: "Accounts and security",
    body:
      "You are responsible for keeping your account credentials secure and for activity that happens under your account. Use accurate account information and contact support promptly if you believe your account has been accessed without permission.",
  },
  {
    title: "Your cards and content",
    body:
      "You keep ownership of the text, images, links, and other content you add to QrMingle. You give QrMingle permission to host, process, display, and share that content as needed to provide the app. Public card links and QR codes may be viewed by anyone who has access to them, so only include information you are comfortable sharing.",
  },
  {
    title: "Business-card scanning and AI assist",
    body:
      "When you use card scanning or AI-assisted features, selected images or prompts may be processed by QrMingle and an AI service provider to extract or draft card details. AI output may be incomplete or incorrect. You are responsible for reviewing and correcting scanned or generated details before saving, sharing, or relying on them.",
  },
  {
    title: "Premium, purchases, and refunds",
    body:
      "QrMingle may offer Premium features such as unlimited card profiles, analytics, advanced styling, unlimited AI profile-builder usage, and priority support. iOS purchases are processed by Apple through the App Store. Monthly and yearly plans renew automatically until canceled in Apple Account settings. Lifetime access is a one-time purchase for the Apple account used. Billing, cancellation, renewal, and refund options are handled through Apple except where required by law.",
  },
  {
    title: "App Store terms",
    body:
      "If you download QrMingle from the Apple App Store, your use of the app may also be subject to Apple's standard Licensed Application End User License Agreement unless a separate license agreement is provided through App Store Connect.",
  },
  {
    title: "Reviews and feedback",
    body:
      "If you submit reviews, feedback, suggestions, or support messages, QrMingle may use them to operate, improve, and promote the app. Public reviews may be moderated before they appear in the app.",
  },
  {
    title: "Account deletion",
    body:
      "You can delete your account from Settings. Account deletion is intended to permanently remove your account, cards, QR links, analytics, and related account data from QrMingle, subject to limited records we may need to retain for security, legal, payment, or operational reasons.",
  },
  {
    title: "Changes and availability",
    body:
      "QrMingle may change, suspend, or discontinue features over time. We may update these Terms when the product, legal requirements, or business operations change. Continued use of QrMingle after an update means you accept the updated Terms.",
  },
];

const PROHIBITED = [
  "Creating misleading, fraudulent, phishing, or spam QR codes or cards",
  "Uploading content you do not have the right to use",
  "Sharing private personal information about others without permission",
  "Attempting to access another user's account or data",
  "Interfering with the app, servers, security, or payment systems",
  "Using QrMingle for illegal, harmful, abusive, or deceptive activity",
];

export default function Terms() {
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
          <FileText size={26} />
        </div>
        <h1 style={{ fontSize: "26px", lineHeight: 1.15, fontWeight: 800, margin: "0 0 8px" }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: "14px", lineHeight: 1.55, opacity: 0.92, margin: 0, maxWidth: "580px" }}>
          These Terms explain the rules for using QrMingle and the responsibilities that come with creating and sharing digital cards.
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
            background: "rgba(99,102,241,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <ShieldCheck size={20} style={{ color: accent }} />
          </div>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            At a glance
          </h2>
        </div>
        <div style={{ display: "grid", gap: "9px" }}>
          {SUMMARY.map((item) => (
            <div key={item} style={{
              display: "grid",
              gridTemplateColumns: "20px minmax(0, 1fr)",
              gap: "9px",
              alignItems: "start",
              color: "#334155",
              fontSize: "14px",
              lineHeight: 1.45,
            }}>
              <CreditCard size={16} style={{ color: accent, marginTop: "2px" }} />
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
        marginBottom: "18px",
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
            <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.65, margin: 0 }}>
              {section.body}
            </p>
          </div>
        ))}
      </section>

      <section style={{
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        borderRadius: "18px",
        padding: "16px",
        marginBottom: "18px",
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
          <AlertTriangle size={20} style={{ color: "#ea580c" }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ color: "#0f172a", fontSize: "15px", fontWeight: 800, margin: "0 0 8px" }}>
            Prohibited conduct
          </h2>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {PROHIBITED.map((item) => (
              <li key={item} style={{ color: "#7c2d12", fontSize: "14px", lineHeight: 1.6 }}>
                {item}
              </li>
            ))}
          </ul>
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
            Questions
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
            Email <a href="mailto:support@qrmingle.com" style={{ color: accent, fontWeight: 700 }}>support@qrmingle.com</a> with questions about these Terms.
          </p>
          <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.4, margin: "10px 0 0" }}>
            Last updated: May 23, 2026
          </p>
        </div>
      </section>
    </main>
  );
}
