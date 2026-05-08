import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { storage } from "../storage";
import { requireAdmin } from "../middleware";
import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const APP_URL = process.env.APP_URL || "https://www.qrmingle.com";
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@qrmingle.com";

export const adminRouter = express.Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    cb(null, "tutorial-" + Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files are allowed."));
  },
});

// All admin routes require admin authentication
adminRouter.use(requireAdmin);

adminRouter.post("/promote", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedUser = await storage.updateUserAdminStatus(userId, true);
    res.json({
      message: "User promoted to admin successfully",
      user: { id: updatedUser.id, username: updatedUser.username, isAdmin: updatedUser.isAdmin },
    });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    res.status(500).json({ message: "Failed to promote user to admin" });
  }
});

adminRouter.get("/analytics", async (req, res) => {
  try {
    const [allLogs, allProfiles, allUsers] = await Promise.all([
      storage.getAllScanLogs(),
      storage.getAllProfiles(),
      storage.getAllUsers(),
    ]);

    const totalScans = allLogs.length;
    const totalUsers = allUsers.length;
    const totalProfiles = allProfiles.length;

    const scansByDate: Record<string, number> = {};
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    allLogs.forEach((log) => {
      if (log.timestamp && log.timestamp >= cutoff) {
        const date = log.timestamp.toISOString().split("T")[0];
        scansByDate[date] = (scansByDate[date] || 0) + 1;
      }
    });

    const countryCounts: Record<string, number> = {};
    const countryCodeMap: Record<string, string> = {};
    allLogs.forEach((log) => {
      const country = log.country || "Unknown";
      countryCounts[country] = (countryCounts[country] || 0) + 1;
      if (log.countryCode && log.country) countryCodeMap[log.country] = log.countryCode;
    });
    const countryData = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, countryCode: countryCodeMap[country] || "", count }))
      .sort((a, b) => b.count - a.count);

    const deviceCounts: Record<string, number> = {};
    allLogs.forEach((log) => {
      let deviceType = "Unknown";
      if (log.device?.includes("Android")) deviceType = "Android";
      else if (log.device?.includes("iPhone") || log.device?.includes("iPad")) deviceType = "iOS";
      else if (log.device?.includes("Windows")) deviceType = "Windows";
      else if (log.device?.includes("Mac")) deviceType = "Mac";
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
    });

    const profileScanMap: Record<number, number> = {};
    allLogs.forEach((log) => {
      profileScanMap[log.profileId] = (profileScanMap[log.profileId] || 0) + 1;
    });
    const topProfiles = Object.entries(profileScanMap)
      .map(([profileId, count]) => {
        const profile = allProfiles.find((p) => p.id === Number(profileId));
        return { name: profile?.name || `Profile ${profileId}`, slug: profile?.slug || "", count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({ totalScans, totalUsers, totalProfiles, scansByDate, countryData, deviceDistribution: deviceCounts, topProfiles });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({ message: "Failed to get admin analytics" });
  }
});

adminRouter.post("/upload-tutorial", videoUpload.single("video"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No video file uploaded" });

    const newFilename = `tutorial-${Date.now()}${path.extname(req.file.originalname)}`;
    const newPath = path.join(uploadsDir, newFilename);
    fs.renameSync(req.file.path, newPath);

    res.json({ message: "Tutorial video uploaded successfully", videoUrl: `/uploads/${newFilename}` });
  } catch (error) {
    console.error("Error uploading tutorial video:", error);
    res.status(500).json({ message: "Failed to upload tutorial video" });
  }
});

adminRouter.post("/send-reset-email", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username/email is required" });

    const user = await storage.getUserByUsername(username);
    if (!user) return res.json({ success: true, message: "If the email exists, a password reset link has been sent" });

    if (!process.env.SENDGRID_API_KEY) {
      return res.status(503).json({ message: "Email service is not configured. Please contact administrator." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    await storage.createPasswordResetToken(resetToken, user.id, expiresAt);

    const resetLink = `${APP_URL}/forgot-password?token=${resetToken}`;
    await sgMail.send({
      to: username,
      from: FROM_EMAIL,
      subject: "Reset your QrMingle password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="color:#6366f1;margin-bottom:8px">Reset your password</h2>
          <p style="color:#475569;margin-bottom:24px">An admin has triggered a password reset for your account. Click the button below — the link expires in 1 hour.</p>
          <a href="${resetLink}" style="display:inline-block;background:#6366f1;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Reset Password</a>
          <p style="color:#cbd5e1;font-size:12px;margin-top:24px">Or copy this link: ${resetLink}</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Password reset instructions have been sent" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Failed to send reset email" });
  }
});

// ONE-TIME migration endpoint — remove after use
adminRouter.post("/migrate-admin-username", async (req, res) => {
  try {
    const user = await storage.getUserByUsername("dathwal@qrmingle#2025");
    if (!user) return res.status(404).json({ message: "Old username not found — already migrated?" });
    const { db } = await import("../db");
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ username: "prashant.dathwal@gmail.com" }).where(eq(users.id, user.id));
    res.json({ success: true, message: `Updated user ${user.id} username to prashant.dathwal@gmail.com` });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({ message: String(error) });
  }
});
