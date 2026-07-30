import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

if (!resend) {
  console.warn("RESEND_API_KEY not found. Email functionality will be limited.");
}

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "QrMingle <noreply@qrmingle.com>";
export const isEmailConfigured = () => !!resend;

export async function sendMail(params: { to: string; subject: string; html: string }): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email to", params.to);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) throw error;
}
