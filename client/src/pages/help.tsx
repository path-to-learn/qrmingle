import {
  BarChart2,
  CreditCard,
  HelpCircle,
  Mail,
  ScanLine,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const accent = "var(--app-accent, #6366f1)";

const QUICK_HELP = [
  {
    icon: CreditCard,
    title: "Cards",
    body: "Create and edit digital cards for different ways you introduce yourself.",
  },
  {
    icon: ScanLine,
    title: "Scan",
    body: "Turn a physical business card or contact-card photo into a draft digital card.",
  },
  {
    icon: BarChart2,
    title: "Analytics",
    body: "See scan activity and card performance when analytics are unlocked.",
  },
];

const FAQS = [
  {
    question: "How do I create my first card?",
    answer:
      "Open the Cards tab and choose New Card. Add your name, title, short bio, photo if you want one, and the links you want people to see. Save the card to generate its QR code and public profile link.",
  },
  {
    question: "How many cards can I create?",
    answer:
      "QrMingle currently supports up to 3 cards per account. This keeps the app simple while still letting you create separate cards for work, events, and personal networking.",
  },
  {
    question: "How do I customize my QR code and card design?",
    answer:
      "Open a card, choose Edit, and use the QR and design options. You can change QR style, color, size, placement, card color, photo placement, and related visual settings.",
  },
  {
    question: "How do I share my card?",
    answer:
      "Use the Share or QR options from your card. You can show the QR code in person, share the public link, or save contact details from a public card. The person receiving your card does not need the QrMingle app.",
  },
  {
    question: "What is the Scan tab for?",
    answer:
      "The Scan tab is for physical business cards and contact-card photos. Choose Camera or Card Photo, crop so the card text fills the frame, and QrMingle will try to extract the contact details. To scan QR codes, use the iPhone Camera app.",
  },
  {
    question: "Why did a card scan fail?",
    answer:
      "Card scanning needs readable text. If the app cannot find contact details, crop closer, use better lighting, avoid glare, and make sure the image is a business card or contact card rather than a portrait or general photo.",
  },
  {
    question: "What does Premium unlock?",
    answer:
      "Premium unlocks higher-value features such as full analytics, premium QR styling, more AI card-builder assistance, and priority support. If you bought Premium on iPhone, use Restore Purchase in Settings if it does not appear after reinstalling or switching devices.",
  },
  {
    question: "How do analytics work?",
    answer:
      "QrMingle counts scans for your cards. Premium analytics adds charts for scan activity, device type, and approximate location so you can understand which card is getting attention.",
  },
  {
    question: "How do I update or delete a card?",
    answer:
      "Open the Cards tab, select the card, and choose Edit to make changes. You can delete a card from its card actions. Deleted cards and their QR links stop being available.",
  },
  {
    question: "Can I delete my account?",
    answer:
      "Yes. Go to Settings, then Danger Zone, and choose Delete Account. This permanently removes your account and associated cards, QR codes, analytics, and contact messages.",
  },
  {
    question: "How do reviews work?",
    answer:
      "The Reviews screen shows approved QrMingle reviews and lets users submit a review. Submitted reviews may be reviewed before they appear publicly.",
  },
];

export default function Help() {
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
          <HelpCircle size={26} />
        </div>
        <h1 style={{ fontSize: "26px", lineHeight: 1.15, fontWeight: 800, margin: "0 0 8px" }}>
          Help Center
        </h1>
        <p style={{ fontSize: "14px", lineHeight: 1.55, opacity: 0.9, margin: 0, maxWidth: "560px" }}>
          Quick answers for creating cards, scanning business cards, sharing QR codes, and managing your account.
        </p>
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "10px",
        marginBottom: "18px",
      }}>
        {QUICK_HELP.map(({ icon: Icon, title, body }) => (
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
            <div style={{ color: "#64748b", fontSize: "12px", lineHeight: 1.4 }}>{body}</div>
          </div>
        ))}
      </section>

      <section style={{
        background: "white",
        border: "1px solid #eef2f7",
        borderRadius: "18px",
        padding: "4px 16px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        marginBottom: "18px",
      }}>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`} className="border-slate-100">
              <AccordionTrigger className="text-left text-[15px] font-bold text-slate-900 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[14px] leading-6 text-slate-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
            Still need help?
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
            Email <a href="mailto:support@qrmingle.com" style={{ color: accent, fontWeight: 700 }}>support@qrmingle.com</a> and include the email on your QrMingle account plus a short description of the issue.
          </p>
        </div>
      </section>
    </main>
  );
}
