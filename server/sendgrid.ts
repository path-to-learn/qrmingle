import { MailService } from '@sendgrid/mail';

// Initialize SendGrid mail service
let mailService: MailService | null = null;

// Initialize the mail service if the API key is available
if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("SendGrid mail service initialized");
} else {
  console.warn("SENDGRID_API_KEY not found. Email functionality will be limited.");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!mailService) {
      console.error('SendGrid mail service not initialized.');
      return false;
    }

    await mailService.send({
      to: params.to,
      from: params.from, // This should be verified in SendGrid
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string, 
  username: string, 
  resetLink: string
): Promise<boolean> {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL ? process.env.SENDGRID_FROM_EMAIL : 'noreply@qrmingle.com';
  
  return sendEmail({
    to: email,
    from: fromEmail,
    subject: 'QrMingle - Password Reset Instructions',
    text: `
      Hello ${username},
      
      We received a request to reset your password for your QrMingle account.
      
      Username: ${username}
      
      To reset your password, click on the link below:
      ${resetLink}
      
      If you did not request a password reset, please ignore this email.
      
      This link will expire in 24 hours.
      
      Regards,
      The QrMingle Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3B82F6; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">QrMingle</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <p>Hello <strong>${username}</strong>,</p>
          
          <p>We received a request to reset your password for your QrMingle account.</p>
          
          <p><strong>Username:</strong> ${username}</p>
          
          <p>To reset your password, click on the button below:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">
            ${resetLink}
          </p>
          
          <p>If you did not request a password reset, please ignore this email.</p>
          
          <p><em>This link will expire in 24 hours.</em></p>
          
          <p>Regards,<br>The QrMingle Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
          &copy; ${new Date().getFullYear()} QrMingle. All rights reserved.
        </div>
      </div>
    `,
  });
}