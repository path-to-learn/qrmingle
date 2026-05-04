import express from "express";
import crypto from "crypto";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { storage } from "../storage";
import { requireAuth } from "../middleware";
import { authLimiter, contactLimiter } from "../limiters";

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

    return res.json({
      success: true,
      message: "If your account exists, a password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
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
