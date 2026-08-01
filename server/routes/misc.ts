import express from "express";
import crypto from "crypto";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { storage } from "../storage";
import { requireAuth } from "../middleware";
import { authLimiter, contactLimiter } from "../limiters";
import { sendMail } from "../mail";
import { isPremiumProductId } from "@shared/premium";
import { verifyStoreKitTransaction, verifyStoreKitNotification } from "../lib/apple-iap";

const APP_URL = process.env.APP_URL || "https://www.qrmingle.com";

export const miscRouter = express.Router();

const uploadsDir = path.join(process.cwd(), "uploads");

const contactFormSchema = z.object({
  profileId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().min(1).max(2000),
});

function hasActivePremiumEntitlement(payload: { productId?: string; revocationDate?: number; expiresDate?: number }) {
  if (!payload?.productId || !isPremiumProductId(payload.productId)) return false;
  if (payload.revocationDate) return false;

  if (payload.expiresDate) {
    if (!Number.isFinite(payload.expiresDate) || payload.expiresDate <= Date.now()) return false;
  }

  return true;
}

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

    await sendMail({
      to: user.username,
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

    return res.json({
      success: true,
      message: "If your account exists, a password reset link has been sent to your email.",
    });
  } catch (error: any) {
    console.error("Forgot password error name:", error?.name);
    console.error("Forgot password error message:", error?.message);
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

miscRouter.post("/iap/verify", requireAuth, async (req, res) => {
  const { jwsRepresentation } = req.body;
  if (!jwsRepresentation) return res.status(400).json({ message: "jwsRepresentation is required" });

  try {
    const payload = await verifyStoreKitTransaction(jwsRepresentation);

    if (!hasActivePremiumEntitlement(payload)) {
      return res.status(400).json({ message: "No active Premium entitlement found" });
    }

    const userId = (req.user as any).id;
    if (payload.originalTransactionId) {
      try {
        await storage.linkAppleOriginalTransactionId(userId, payload.originalTransactionId);
      } catch {
        return res.status(409).json({
          message: "This purchase is already linked to a different QrMingle account. Log in with that account, or contact support.",
        });
      }
    }
    await storage.updateUserPremiumStatus(userId, true);

    return res.json({ success: true });
  } catch (error) {
    console.error("IAP verify error:", error);
    return res.status(400).json({ message: "Could not verify this purchase with Apple" });
  }
});

miscRouter.post("/iap/restore", requireAuth, async (req, res) => {
  const { transactions } = req.body as { transactions: { jwsRepresentation: string }[] };
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.json({ restored: false });
  }

  for (const tx of transactions) {
    try {
      const payload = await verifyStoreKitTransaction(tx.jwsRepresentation);
      if (hasActivePremiumEntitlement(payload)) {
        const userId = (req.user as any).id;
        if (payload.originalTransactionId) {
          try {
            await storage.linkAppleOriginalTransactionId(userId, payload.originalTransactionId);
          } catch {
            console.error("IAP restore: transaction already linked to a different account, skipping");
            continue;
          }
        }
        await storage.updateUserPremiumStatus(userId, true);
        return res.json({ restored: true });
      }
    } catch (error) {
      console.error("IAP restore: skipping unverifiable transaction:", error);
      // Keep checking the remaining transactions instead of failing the whole restore.
    }
  }
  return res.json({ restored: false });
});

// Apple's App Store Server Notifications (V2) webhook — no session auth, Apple calls this
// server-to-server whenever a subscription's status changes (renewal, cancellation, refund,
// expiration, billing failure, etc). Configure this URL in App Store Connect under
// App Information > App Store Server Notifications: https://www.qrmingle.com/api/iap/notifications
//
// DID_CHANGE_RENEWAL_PREF is deliberately excluded — it only means the plan the user will be
// billed for at their *next* renewal changed (e.g. monthly -> yearly), not that their current
// entitlement changed. Granting Premium on it would be wrong.
const PREMIUM_GRANTING_NOTIFICATIONS = new Set([
  "SUBSCRIBED",
  "DID_RENEW",
  "OFFER_REDEEMED",
  "RENEWAL_EXTENDED",
  "REFUND_REVERSED",
]);

const PREMIUM_REVOKING_NOTIFICATIONS = new Set([
  "EXPIRED",
  "REFUND",
  "REVOKE",
  "GRACE_PERIOD_EXPIRED",
]);

miscRouter.post("/iap/notifications", async (req, res) => {
  try {
    const { signedPayload } = req.body as { signedPayload?: string };
    if (!signedPayload) return res.status(400).json({ message: "signedPayload is required" });

    const notification = await verifyStoreKitNotification(signedPayload);
    const signedTransactionInfo = notification.data?.signedTransactionInfo;
    const notificationType = notification.notificationType;

    if (!signedTransactionInfo || !notificationType) {
      // Nothing actionable — e.g. a TEST notification, or a summary/externalPurchaseToken payload.
      return res.status(200).json({ received: true });
    }

    const transaction = await verifyStoreKitTransaction(signedTransactionInfo);
    if (!transaction.originalTransactionId) {
      return res.status(200).json({ received: true });
    }

    const user = await storage.getUserByAppleOriginalTransactionId(transaction.originalTransactionId);
    if (!user) {
      // Transaction not linked to any user yet (e.g. notification arrived before /iap/verify did).
      return res.status(200).json({ received: true });
    }

    // Apple retries failed deliveries and doesn't guarantee ordering, so an old EXPIRED/REFUND
    // could arrive after we've already processed a newer DID_RENEW (or vice versa). Ignore
    // anything older than (or equal to) the last notification we actually applied for this user.
    const incomingSignedDate = notification.signedDate ? new Date(notification.signedDate) : null;
    if (incomingSignedDate && user.appleLastNotificationSignedDate &&
        incomingSignedDate <= new Date(user.appleLastNotificationSignedDate)) {
      return res.status(200).json({ received: true, stale: true });
    }

    if (PREMIUM_GRANTING_NOTIFICATIONS.has(notificationType) && !user.isPremium) {
      await storage.updateUserPremiumStatus(user.id, true);
    } else if (PREMIUM_REVOKING_NOTIFICATIONS.has(notificationType) && user.isPremium) {
      await storage.updateUserPremiumStatus(user.id, false);
    }

    if (incomingSignedDate) {
      await storage.updateAppleLastNotificationSignedDate(user.id, incomingSignedDate);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("IAP notification error:", error);
    // 500 so Apple retries — most failures here are transient (DB hiccup, etc), not a reason
    // to silently drop a subscription-status change.
    return res.status(500).json({ message: "Failed to process notification" });
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
