import express from "express";
import crypto from "crypto";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { storage } from "../storage";
import { requireAuth } from "../middleware";
import { authLimiter, contactLimiter } from "../limiters";
import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const APP_URL = process.env.APP_URL || "https://www.qrmingle.com";
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@qrmingle.com";

export const miscRouter = express.Router();

const uploadsDir = path.join(process.cwd(), "uploads");

const contactFormSchema = z.object({
  profileId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().min(1).max(2000),
});

miscRouter.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await storage.getUserByUsername(email);
    if (!user) {
      return res.json({ success: true, message: "If your account exists, we've created a reset token." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    await storage.createPasswordResetToken(resetToken, user.id, expiresAt);

    const resetLink = `${APP_URL}/forgot-password?token=${resetToken}`;

    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send({
        to: user.username,
        from: FROM_EMAIL,
        subject: "Reset your QrMingle password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
            <h2 style="color:#6366f1;margin-bottom:8px">Reset your password</h2>
            <p style="color:#475569;margin-bottom:24px">
              We received a request to reset your QrMingle password.
              Click the button below — the link expires in 1 hour.
            </p>
            <a href="${resetLink}"
               style="display:inline-block;background:#6366f1;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
              Reset Password
            </a>
            <p style="color:#94a3b8;font-size:13px;margin-top:24px">
              If you didn't request this, you can safely ignore this email.
            </p>
            <p style="color:#cbd5e1;font-size:12px;margin-top:8px">
              Or copy this link: ${resetLink}
            </p>
          </div>
        `,
      });
    } else {
      console.warn("SENDGRID_API_KEY not set — skipping email. Reset token:", resetToken);
    }

    return res.json({
      success: true,
      message: "If your account exists, a password reset link has been sent to your email.",
    });
  } catch (error: any) {
    console.error("Forgot password error code:", error?.code);
    console.error("Forgot password error message:", error?.message);
    console.error("Forgot password SG body:", JSON.stringify(error?.response?.body ?? null));
    res.status(500).json({ message: "Failed to process forgot password request" });
  }
});

miscRouter.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Token and new password are required" });

    const tokenData = await storage.getPasswordResetToken(token);
    if (!tokenData) return res.status(400).json({ message: "Invalid or expired token" });

    if (new Date() > tokenData.expiresAt) {
      await storage.deletePasswordResetToken(token);
      return res.status(400).json({ message: "Reset token has expired" });
    }

    const user = await storage.getUser(tokenData.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await storage.updateUserPassword(user.id, newPassword);
    await storage.deletePasswordResetToken(token);

    return res.json({
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// ONE-TIME migration — remove after running once
miscRouter.post("/run-admin-migration", async (req, res) => {
  try {
    const user = await storage.getUserByUsername("dathwal@qrmingle#2025");
    if (!user) return res.json({ success: false, message: "Old username not found — already migrated" });
    const { db } = await import("../db");
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ username: "prashant.dathwal@gmail.com" }).where(eq(users.id, user.id));
    res.json({ success: true, message: `Done — user ${user.id} updated` });
  } catch (e) {
    res.status(500).json({ message: String(e) });
  }
});

miscRouter.post("/iap/verify", requireAuth, async (req, res) => {
  const { jwsRepresentation } = req.body;
  if (!jwsRepresentation) return res.status(400).json({ message: "jwsRepresentation is required" });

  try {
    const parts = jwsRepresentation.split(".");
    if (parts.length !== 3) return res.status(400).json({ message: "Invalid JWS format" });

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));

    if (payload.productId !== "com.qrmingle.app.premium") {
      return res.status(400).json({ message: "Unexpected product ID" });
    }

    const userId = (req.user as any).id;
    await storage.updateUserPremiumStatus(userId, true);

    return res.json({ success: true });
  } catch (error) {
    console.error("IAP verify error:", error);
    return res.status(500).json({ message: "Failed to verify purchase" });
  }
});

miscRouter.post("/iap/restore", requireAuth, async (req, res) => {
  const { transactions } = req.body as { transactions: { jwsRepresentation: string }[] };
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.json({ restored: false });
  }

  try {
    for (const tx of transactions) {
      const parts = tx.jwsRepresentation.split(".");
      if (parts.length !== 3) continue;
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      if (payload.productId === "com.qrmingle.app.premium") {
        const userId = (req.user as any).id;
        await storage.updateUserPremiumStatus(userId, true);
        return res.json({ restored: true });
      }
    }
    return res.json({ restored: false });
  } catch (error) {
    console.error("IAP restore error:", error);
    return res.status(500).json({ message: "Failed to restore purchases" });
  }
});

miscRouter.delete("/auth/account", async (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
  try {
    const userId = req.user!.id;
    req.logout((err) => {
      if (err) return next(err);
    });
    await storage.deleteUser(userId);
    res.sendStatus(200);
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

miscRouter.post("/contact-form", contactLimiter, async (req, res) => {
  try {
    let parsed: z.infer<typeof contactFormSchema>;
    try {
      parsed = contactFormSchema.parse(req.body);
    } catch {
      return res.status(400).json({ message: "Invalid input. Check all fields are filled correctly." });
    }

    const { profileId, name, email, message } = parsed;
    const profile = await storage.getProfile(profileId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const contactMessage = await storage.createContactMessage({ profileId, name, email, message });
    res.json({ success: true, message: "Contact form submitted successfully", contactMessage });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: "Failed to submit contact form" });
  }
});

miscRouter.get("/contact-messages/:profileId", requireAuth, async (req, res) => {
  try {
    const profileId = parseInt(req.params.profileId);
    if (isNaN(profileId)) return res.status(400).json({ message: "Invalid profile ID" });

    const profile = await storage.getProfile(profileId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.userId !== req.user!.id)
      return res.status(403).json({ message: "You don't have permission to view these messages" });

    const messages = await storage.getContactMessagesByProfileId(profileId);
    res.json(messages);
  } catch (error) {
    console.error("Get contact messages error:", error);
    res.status(500).json({ message: "Failed to get contact messages" });
  }
});

miscRouter.patch("/contact-messages/:id/read", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid message ID" });

    const messages = await storage.getContactMessagesByProfileId(parseInt(req.body.profileId));
    const message = messages.find((m) => m.id === id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const profile = await storage.getProfile(message.profileId);
    if (!profile || profile.userId !== req.user!.id)
      return res.status(403).json({ message: "You don't have permission to update this message" });

    const updatedMessage = await storage.markContactMessageAsRead(id);
    res.json(updatedMessage);
  } catch (error) {
    console.error("Mark message as read error:", error);
    res.status(500).json({ message: "Failed to mark message as read" });
  }
});

miscRouter.get("/tutorial-video", (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) return res.status(404).json({ message: "No tutorial video found" });
    const files = fs.readdirSync(uploadsDir);
    const tutorialVideos = files.filter((f) => f.startsWith("tutorial-"));
    if (tutorialVideos.length === 0) return res.status(404).json({ message: "No tutorial video found" });

    const latestVideo = tutorialVideos.sort().reverse()[0];
    res.json({ videoUrl: `/uploads/${latestVideo}` });
  } catch (error) {
    console.error("Error fetching tutorial video:", error);
    res.status(500).json({ message: "Failed to fetch tutorial video" });
  }
});
