export default function Privacy() {
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 16px 100px" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        borderRadius: "16px",
        padding: "28px 24px",
        marginBottom: "24px",
        color: "white",
      }}>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔒</div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>Your privacy, plainly explained</h1>
        <p style={{ fontSize: "14px", opacity: 0.9, margin: 0, lineHeight: 1.5 }}>
          No legal jargon. Just a straight answer to what we collect, why, and what we never do.
        </p>
      </div>

      {/* At a glance */}
      <div style={{
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "24px",
      }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#15803d", margin: "0 0 12px" }}>✅ At a glance</h2>
        {[
          "Your data is never sold to anyone, ever.",
          "We don't track you across other apps or websites.",
          "No ads. No ad networks. No profiling.",
          "You can delete your account and all your data at any time.",
          "We don't access your contacts, camera, or location in the background.",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
            <span style={{ color: "#16a34a", fontWeight: 700, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: "14px", color: "#166534" }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Section helper */}
      {[
        {
          title: "What you give us",
          body: "When you create an account, you give us your email address (used as your username) and a password. When you build a profile card, you add your name, title, bio, photo, and social links. You're in full control of what goes on your card — put in only what you're comfortable sharing publicly.",
        },
        {
          title: "What we collect when someone scans your QR code",
          body: "Each scan logs: the date and time, the country and city (approximate, based on IP), the device type (iPhone, Android, Desktop), and the browser. This is your analytics — it helps you understand who's discovering your card. The person scanning is not asked to log in or share any personal information.",
          highlight: "The scan log is only visible to you, the card owner. It is never shared publicly.",
        },
        {
          title: "Passwords",
          body: "Your password is never stored in plain text. We use scrypt — a strong one-way hashing algorithm — so even we cannot see your password. If you forget it, it cannot be recovered, only reset.",
        },
        {
          title: "Photos and profile images",
          body: "Profile photos you upload are stored securely and only displayed as part of your public card. We don't use your photos for any other purpose — no facial recognition, no AI training, nothing else.",
        },
        {
          title: "Sessions and cookies",
          body: "When you log in, we store a secure session cookie so you stay logged in. This cookie is not used for advertising or tracking — it's purely to keep you signed in. It expires after 7 days of inactivity.",
        },
        {
          title: "What we never do",
          items: [
            "Sell your data to third parties",
            "Share your information with advertisers",
            "Track you across other websites or apps",
            "Access your phone's contacts, microphone, or location in the background",
            "Use your content to train AI models",
          ],
        },
        {
          title: "Third-party services we use",
          body: "We use a small number of trusted services to run QrMingle:",
          items: [
            "Neon (PostgreSQL) — stores your account and profile data securely",
            "Stripe — handles payments for Premium. We never see or store your card number.",
            "SendGrid — sends transactional emails (e.g. password reset). We don't send marketing emails without your consent.",
          ],
        },
        {
          title: "Deleting your account",
          body: "You can permanently delete your account from the Settings screen at any time. This immediately and irreversibly removes your account, all profile cards, all QR codes, all scan history, and all contact messages. Nothing is retained.",
        },
        {
          title: "Children",
          body: "QrMingle is not intended for children under 13. We do not knowingly collect data from children under 13. If you believe a child has created an account, contact us and we will delete it immediately.",
        },
        {
          title: "Changes to this policy",
          body: "If we ever make a meaningful change to how we handle your data, we'll notify you in the app before the change takes effect. The 'last updated' date at the bottom of this page always reflects the most recent version.",
        },
        {
          title: "Contact us",
          body: "Questions, concerns, or data requests — email us at support@qrmingle.com. We aim to respond within 48 hours.",
        },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>
            {section.title}
          </h2>
          {section.body && (
            <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, margin: "0 0 8px" }}>
              {section.body}
            </p>
          )}
          {section.highlight && (
            <div style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#1d4ed8",
              marginTop: "8px",
            }}>
              {section.highlight}
            </div>
          )}
          {section.items && (
            <ul style={{ margin: "4px 0 0", paddingLeft: "20px" }}>
              {section.items.map((item, j) => (
                <li key={j} style={{ fontSize: "14px", color: "#475569", lineHeight: 1.7 }}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <div style={{
        borderTop: "1px solid #e2e8f0",
        paddingTop: "16px",
        fontSize: "13px",
        color: "#94a3b8",
      }}>
        Last updated: May 2026
      </div>
    </div>
  );
}
