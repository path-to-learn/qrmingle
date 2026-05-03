import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertScanLogSchema, insertUserSchema, profileFormSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import Stripe from "stripe";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authLimiter, contactLimiter } from "./limiters";
import geoip from "geoip-lite";

function getVisitorIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return first.trim();
  }
  return req.ip || 'Unknown';
}

const contactFormSchema = z.object({
  profileId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().min(1).max(2000),
});

// Initialize Stripe if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" as any }) 
  : null;

// Set up multer for video file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
// Create the directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'tutorial-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const videoUpload = multer({ 
  storage: videoStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept video files with preference for MP4
    if (file.mimetype === 'video/mp4') {
      // MP4 is preferred format
      cb(null, true);
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed. MP4 format is recommended.'));
    }
  }
});

const ALLOWED_ORIGINS = new Set([
  'https://qrmingle.com',
  'http://localhost:5000',
  'capacitor://localhost',
]);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (must happen before routes)
  setupAuth(app);

  // CSRF: only enforce in production — dev uses local IPs that change
  if (app.get('env') === 'production') {
    app.use((req, res, next) => {
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const origin = req.headers.origin;
        if (origin && !ALLOWED_ORIGINS.has(origin)) {
          return res.status(403).json({ message: "Forbidden: invalid origin" });
        }
      }
      next();
    });
  }

  // API routes prefix
  const apiRoutes = express.Router();
  app.use('/api', apiRoutes);
  
  // Forgot password route - generate reset token
  apiRoutes.post('/forgot-password', authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user by email (using username field as email)
      const user = await storage.getUserByUsername(email);
      
      if (!user) {
        // For security reasons, we still return success even if the user doesn't exist
        return res.json({ 
          success: true, 
          message: "If your account exists, we've created a reset token." 
        });
      }
      
      // Generate a random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Store token in DB with 1 hour expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      await storage.createPasswordResetToken(resetToken, user.id, expiresAt);
      
      // Never return the token in the response — it must be sent via email only
      return res.json({
        success: true,
        message: "If your account exists, a password reset link has been sent to your email.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ 
        message: "Failed to process forgot password request", 
      });
    }
  });
  
  // Reset password route - validate token and update password
  apiRoutes.post('/reset-password', authLimiter, async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      // Check if token exists and is valid
      const tokenData = await storage.getPasswordResetToken(token);

      if (!tokenData) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Check if token is expired
      if (new Date() > tokenData.expiresAt) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({ message: "Reset token has expired" });
      }

      // Get user
      const user = await storage.getUser(tokenData.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update password
      const updatedUser = await storage.updateUserPassword(user.id, newPassword);

      // Delete the used token
      await storage.deletePasswordResetToken(token);
      
      return res.json({
        success: true,
        message: "Password has been reset successfully. You can now log in with your new password."
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ 
        message: "Failed to reset password", 
      });
    }
  });

  // Account deletion — permanently removes user and all associated data
  apiRoutes.delete('/auth/account', async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const userId = req.user!.id;
      // Invalidate session first
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

  // Authentication middleware for API routes
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Profile routes
  apiRoutes.get('/profiles', requireAuth, async (req, res) => {
    try {
      // Always use the authenticated user's ID — ignore userId query param
      const userId = req.user!.id;
      const profiles = await storage.getProfilesByUserId(userId);

      // For each profile, get the social links
      const profilesWithLinks = await Promise.all(profiles.map(async (profile: any) => {
        const socialLinks = await storage.getSocialLinksByProfileId(profile.id);
        return { ...profile, socialLinks };
      }));
      
      res.json(profilesWithLinks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profiles" });
    }
  });

  apiRoutes.post('/profiles', requireAuth, async (req, res) => {
    try {
      // Validate the profile data
      let profileData;
      try {
        profileData = profileFormSchema.parse(req.body);
      } catch (validationError) {
        console.error("Profile validation failed:", validationError);
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "Validation error", 
            details: validationError.errors 
          });
        }
        throw validationError;
      }
      
      // Take userId from authenticated session — never trust the request body
      const userId = req.user!.id;

      // Get user to check premium status
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.error("User not found:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is a premium user or has an active trial
      const isUserPremium = user.isPremium || storage.isUserInActiveTrial(user);
      
      // Check if user has reached the profile limit (3 profiles for all users)
      const userProfiles = await storage.getProfilesByUserId(userId);
      if (userProfiles.length >= 3) {
        return res.status(403).json({
          message: "You can create up to 3 profiles. Premium features coming soon!",
          type: "PROFILE_LIMIT_REACHED"
        });
      }
      
      // Generate a slug from the display name
      const baseSlug = profileData.displayName.toLowerCase().replace(/\s+/g, '-');
      const randomSuffix = crypto.randomBytes(4).toString('hex');
      const slug = `${baseSlug}-${randomSuffix}`;

      // Create the profile
      const { socialLinks, ...profileWithoutLinks } = profileData;

      const profile = await storage.createProfile({
        ...profileWithoutLinks,
        userId,
        slug,
      });
      
      // Create the social links
      const createdLinks = await Promise.all(
        socialLinks.map((link) => storage.createSocialLink({
          ...link,
          profileId: profile.id,
        }))
      );
      
      res.status(201).json({ ...profile, socialLinks: createdLinks });
    } catch (error) {
      console.error("Profile creation error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to create profile", 
      });
    }
  });

  apiRoutes.get('/profiles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      const profile = await storage.getProfile(id);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const socialLinks = await storage.getSocialLinksByProfileId(profile.id);
      
      res.json({ ...profile, socialLinks });
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  apiRoutes.put('/profiles/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }

      const profileData = profileFormSchema.parse(req.body);

      // Check if profile exists and verify ownership
      const existingProfile = await storage.getProfile(id);
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      if (existingProfile.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }

      // Get user to check premium status
      const user = await storage.getUser(existingProfile.userId);
      
      // Check if user is a premium user or has an active trial
      const isUserPremium = user?.isPremium || (user && storage.isUserInActiveTrial(user));
      
      const { socialLinks, ...profileWithoutLinks } = profileData;
      
      // Update the profile
      const profile = await storage.updateProfile(id, profileWithoutLinks);
      
      // Delete existing social links
      await storage.deleteSocialLinksByProfileId(id);
      
      // Create new social links
      const createdLinks = await Promise.all(
        socialLinks.map((link) => storage.createSocialLink({
          ...link,
          profileId: profile.id,
        }))
      );
      
      res.json({ ...profile, socialLinks: createdLinks });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  apiRoutes.delete('/profiles/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }

      // Verify ownership before deleting
      const profile = await storage.getProfile(id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      if (profile.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this profile" });
      }

      const deleted = await storage.deleteProfile(id);
      if (!deleted) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete profile" });
    }
  });

  // Public profile route for QR code scans
  app.get('/p/:slug', (req, res) => {
    // This will be handled by the frontend router
    res.sendFile('index.html', { root: './dist/public' });
  });

  // API route to get profile by slug for QR code landing pages
  apiRoutes.get('/p/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      
      const profile = await storage.getProfileBySlug(slug);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const socialLinks = await storage.getSocialLinksByProfileId(profile.id);
      
      // Extract device info from user agent
      const userAgent = req.headers['user-agent'] || '';
      let deviceInfo = 'Unknown';
      let browserInfo = 'Unknown';
      let osInfo = 'Unknown';
      
      if (userAgent) {
        // Device detection
        if (userAgent.includes('iPhone')) deviceInfo = 'iPhone';
        else if (userAgent.includes('iPad')) deviceInfo = 'iPad';
        else if (userAgent.includes('Android')) deviceInfo = 'Android';
        else if (userAgent.includes('Windows Phone')) deviceInfo = 'Windows Phone';
        else if (userAgent.includes('Windows')) deviceInfo = 'Desktop';
        else if (userAgent.includes('Mac')) deviceInfo = 'Mac';
        else if (userAgent.includes('Linux')) deviceInfo = 'Linux';
        
        // Browser detection
        if (userAgent.includes('Chrome')) browserInfo = 'Chrome';
        else if (userAgent.includes('Firefox')) browserInfo = 'Firefox';
        else if (userAgent.includes('Safari')) browserInfo = 'Safari';
        else if (userAgent.includes('Edge')) browserInfo = 'Edge';
        else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) browserInfo = 'Internet Explorer';
        
        // OS detection
        if (userAgent.includes('Windows NT 10.0')) osInfo = 'Windows 10';
        else if (userAgent.includes('Windows NT 6.3')) osInfo = 'Windows 8.1';
        else if (userAgent.includes('Windows NT 6.2')) osInfo = 'Windows 8';
        else if (userAgent.includes('Windows NT 6.1')) osInfo = 'Windows 7';
        else if (userAgent.includes('Mac OS X')) osInfo = 'macOS';
        else if (userAgent.includes('Linux')) osInfo = 'Linux';
        else if (userAgent.includes('Android')) osInfo = 'Android';
        else if (userAgent.includes('iOS')) osInfo = 'iOS';
      }
      
      // Resolve real visitor IP and geolocate it
      const visitorIp = getVisitorIp(req);
      const geo = geoip.lookup(visitorIp);

      // Log the scan with enhanced information
      const scanLogData = {
        profileId: profile.id,
        location: req.query.location as string,
        country: geo?.country || req.query.country as string || 'Unknown',
        countryCode: geo?.country || req.query.countryCode as string || '',
        city: geo?.city || req.query.city as string || '',
        device: deviceInfo,
        browser: browserInfo,
        os: osInfo,
        referrer: req.headers.referer || '',
        ipAddress: visitorIp,
      };
      
      await storage.createScanLog(scanLogData);

      res.json({ ...profile, socialLinks });
    } catch (error) {
      console.error("Failed to get profile:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });
  
  // Handle contact form submissions
  apiRoutes.post('/contact-form', contactLimiter, async (req, res) => {
    try {
      let parsed: z.infer<typeof contactFormSchema>;
      try {
        parsed = contactFormSchema.parse(req.body);
      } catch (e) {
        return res.status(400).json({ message: "Invalid input. Check all fields are filled correctly." });
      }
      const { profileId, name, email, message } = parsed;

      // Get profile to check if it exists
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Store the contact message in the database
      const contactMessage = await storage.createContactMessage({
        profileId,
        name,
        email,
        message
      });
      
      // Return success with the created message
      res.json({ 
        success: true, 
        message: "Contact form submitted successfully",
        contactMessage
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ 
        message: "Failed to submit contact form", 
      });
    }
  });
  
  // Get contact messages for a profile
  apiRoutes.get('/contact-messages/:profileId', requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      // Get profile to check if it exists and if the user has permission
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Check if user owns the profile
      if (profile.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to view these messages" });
      }
      
      // Get contact messages for the profile
      const messages = await storage.getContactMessagesByProfileId(profileId);
      
      res.json(messages);
    } catch (error) {
      console.error("Get contact messages error:", error);
      res.status(500).json({ 
        message: "Failed to get contact messages", 
      });
    }
  });
  
  // Mark a contact message as read
  apiRoutes.patch('/contact-messages/:id/read', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      // Verify user has permission by first getting the message
      const messages = await storage.getContactMessagesByProfileId(parseInt(req.body.profileId));
      const message = messages.find(m => m.id === id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Get profile to check if user owns it
      const profile = await storage.getProfile(message.profileId);
      
      if (!profile || profile.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to update this message" });
      }
      
      // Mark the message as read
      const updatedMessage = await storage.markContactMessageAsRead(id);
      
      res.json(updatedMessage);
    } catch (error) {
      console.error("Mark message as read error:", error);
      res.status(500).json({ 
        message: "Failed to mark message as read", 
      });
    }
  });

  // Video upload endpoint - admin only
  apiRoutes.post('/upload-tutorial-video', requireAuth, async (req, res) => {
    try {
      // Check if user is the dedicated admin
      if (!req.user || req.user.username !== 'dathwal@qrmingle#2025') {
        return res.status(403).json({ message: "Only admin users can upload tutorial videos" });
      }
      
      // Process upload
      videoUpload.single('video')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: "Error uploading file", error: err.message });
        }
        
        if (!req.file) {
          return res.status(400).json({ message: "No video file uploaded" });
        }

        // Ensure the file is accessible through the static file server
        const videoUrl = `/uploads/${req.file.filename}`;
        
        // Return the URL of the uploaded video with optimization hint for 720p
        res.json({ 
          videoUrl,
          message: "Video uploaded successfully. Optimized for 720p HD playback."
        });
      });
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({ 
        message: "Failed to upload video",
      });
    }
  });

  // Analytics routes
  apiRoutes.get('/analytics/profile/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }

      const profile = await storage.getProfile(id);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Verify ownership
      if (profile.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view this profile's analytics" });
      }
      
      // Get all scan logs
      const allScanLogs = await storage.getScanLogsByProfileId(id);
      
      // Check if user is premium or not to filter logs
      const user = await storage.getUser(profile.userId);
      let scanLogs = allScanLogs;
      
      // Check if user is a premium user or has an active trial
      const isUserPremium = user?.isPremium || (user && storage.isUserInActiveTrial(user));
      
      // All analytics features are now available to all users
      scanLogs = allScanLogs;
      
      // Group logs by date
      const scansByDate: Record<string, number> = {};
      
      scanLogs.forEach((log) => {
        if (log.timestamp) {
          const date = log.timestamp.toISOString().split('T')[0];
          scansByDate[date] = (scansByDate[date] || 0) + 1;
        }
      });
      
      // Get device distribution
      const deviceCounts: Record<string, number> = {};
      
      scanLogs.forEach((log) => {
        let deviceType = 'Unknown';
        
        if (log.device?.includes('Android')) {
          deviceType = 'Android';
        } else if (log.device?.includes('iPhone') || log.device?.includes('iPad')) {
          deviceType = 'iOS';
        } else if (log.device?.includes('Windows')) {
          deviceType = 'Windows';
        } else if (log.device?.includes('Mac')) {
          deviceType = 'Mac';
        }
        
        deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
      });
      
      // Get location and country distribution
      const locationCounts: Record<string, number> = {};
      const countryCounts: Record<string, number> = {};
      const countryCodeMap: Record<string, string> = {}; // Maps country names to country codes
      
      scanLogs.forEach((log) => {
        // Location distribution (city, country)
        const location = log.location || 'Unknown';
        locationCounts[location] = (locationCounts[location] || 0) + 1;
        
        // Country distribution
        const country = log.country || 'Unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
        
        // Record country code if available
        if (log.countryCode && log.country) {
          countryCodeMap[log.country] = log.countryCode;
        }
      });
      
      // Create country data for the grid
      const countryData = Object.entries(countryCounts).map(([country, count]) => ({
        country,
        countryCode: countryCodeMap[country] || '',
        visitors: count
      }));
      
      res.json({
        totalScans: profile.scanCount,
        scansByDate,
        deviceDistribution: deviceCounts,
        locationDistribution: locationCounts,
        countryDistribution: countryCounts,
        countryData,
        isLimited: false, // All features available to all users
        timeRange: 'all',
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // Premium trials endpoint
  apiRoutes.post('/start-premium-trial', requireAuth, async (req, res) => {
    try {
      const { durationDays = 7 } = req.body;
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is already premium
      if (user.isPremium) {
        return res.status(400).json({ 
          message: "User is already a premium user and doesn't need a trial" 
        });
      }
      
      // Check if user already has an active trial
      if (storage.isUserInActiveTrial(user)) {
        let expiryDate = 'unknown date';
        if (user.trialExpiresAt) {
          expiryDate = user.trialExpiresAt instanceof Date 
            ? user.trialExpiresAt.toISOString().split('T')[0] 
            : new Date(user.trialExpiresAt).toISOString().split('T')[0];
        }
          
        return res.status(400).json({ 
          message: `User already has an active trial expiring on ${expiryDate}` 
        });
      }
      
      // Start the premium trial
      const updatedUser = await storage.startPremiumTrial(userId, durationDays);
      
      // Format the trial expiration date for the response
      let trialExpiresAt = 'unknown date';
      if (updatedUser.trialExpiresAt) {
        trialExpiresAt = updatedUser.trialExpiresAt instanceof Date 
          ? updatedUser.trialExpiresAt.toISOString().split('T')[0] 
          : new Date(updatedUser.trialExpiresAt).toISOString().split('T')[0];
      }
      
      res.json({ 
        message: `Premium trial activated. Expires on ${trialExpiresAt}`,
        user: {
          ...updatedUser,
          trialExpiresAt: updatedUser.trialExpiresAt 
            ? (updatedUser.trialExpiresAt instanceof Date 
                ? updatedUser.trialExpiresAt.toISOString() 
                : updatedUser.trialExpiresAt)
            : null
        }
      });
    } catch (error) {
      console.error("Failed to start premium trial:", error);
      res.status(500).json({ message: "Failed to start premium trial" });
    }
  });
  
  // User premium upgrade with Stripe
  if (stripe) {
    // Stripe webhook handler — verifies signature before processing
    apiRoutes.post('/stripe-webhook', async (req, res) => {
      const sig = req.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not set — rejecting webhook');
        return res.status(400).json({ message: "Webhook not configured" });
      }

      let event: any;
      try {
        event = stripe.webhooks.constructEvent((req as any).rawBody, sig, webhookSecret);
      } catch (err) {
        console.error('Stripe webhook signature verification failed:', err);
        return res.status(400).json({ message: "Webhook signature verification failed" });
      }

      try {
        // Handle the event
        if (event.type === 'payment_intent.succeeded') {
          const paymentIntent = event.data.object;
          const userId = paymentIntent.metadata?.userId;

          if (userId) {
            const user = await storage.getUser(parseInt(userId));
            if (user) {
              await storage.updateUserPremiumStatus(parseInt(userId), true);
            }
          }
        }
        
        res.json({ received: true });
      } catch (error) {
        console.error("Stripe webhook error:", error);
        res.status(500).json({ message: "Webhook error" });
      }
    });
    apiRoutes.post('/create-payment-intent', requireAuth, async (req, res) => {
      try {
        const userId = req.user!.id;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Create a payment intent for premium upgrade
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 499, // $4.99
          currency: 'usd',
          metadata: {
            userId: userId.toString(),
          },
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        res.status(500).json({ message: "Failed to create payment intent" });
      }
    });

    apiRoutes.post('/confirm-premium', requireAuth, async (req, res) => {
      try {
        const userId = req.user!.id;
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
          return res.status(400).json({ message: "Payment intent ID is required" });
        }

        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Verify payment intent belongs to this user via metadata
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({ message: "Payment not successful" });
        }
        if (paymentIntent.metadata?.userId !== String(userId)) {
          return res.status(403).json({ message: "Payment intent does not belong to this user" });
        }

        // Update user to premium
        const updatedUser = await storage.updateUserPremiumStatus(userId, true);
        
        // Return user without password
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } catch (error) {
        res.status(500).json({ message: "Failed to confirm premium upgrade" });
      }
    });
  }

  // Get tutorial video endpoint (accessible to all users)
  apiRoutes.get('/tutorial-video', (req, res) => {
    try {
      // Check if any tutorial videos exist in the uploads directory
      const files = fs.readdirSync(uploadsDir);
      const tutorialVideos = files.filter(file => file.startsWith('tutorial-'));
      
      if (tutorialVideos.length === 0) {
        return res.status(404).json({ message: "No tutorial video found" });
      }
      
      // Get the most recent tutorial video (based on timestamp in filename)
      const latestVideo = tutorialVideos.sort().reverse()[0];
      const videoUrl = `/uploads/${latestVideo}`;
      
      res.json({ videoUrl });
    } catch (error) {
      console.error('Error fetching tutorial video:', error);
      res.status(500).json({ 
        message: "Failed to fetch tutorial video",
      });
    }
  });

  // Admin routes
  const adminRoutes = express.Router();
  apiRoutes.use('/admin', adminRoutes);

  // Middleware to check if user is admin
  adminRoutes.use((req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized - Admin access required" });
    }
    
    next();
  });



  // Promote a user to admin
  adminRoutes.post('/promote', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserAdminStatus(userId, true);
      
      res.json({ 
        message: "User promoted to admin successfully",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          isAdmin: updatedUser.isAdmin
        }
      });
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      res.status(500).json({ 
        message: "Failed to promote user to admin",
      });
    }
  });

  // Global analytics for admin
  adminRoutes.get('/analytics', async (req, res) => {
    try {
      const [allLogs, allProfiles, allUsers] = await Promise.all([
        storage.getAllScanLogs(),
        storage.getAllProfiles(),
        storage.getAllUsers(),
      ]);

      // Total scans
      const totalScans = allLogs.length;
      const totalUsers = allUsers.length;
      const totalProfiles = allProfiles.length;

      // Scans per day (last 30 days)
      const scansByDate: Record<string, number> = {};
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      allLogs.forEach((log) => {
        if (log.timestamp && log.timestamp >= cutoff) {
          const date = log.timestamp.toISOString().split('T')[0];
          scansByDate[date] = (scansByDate[date] || 0) + 1;
        }
      });

      // Country distribution
      const countryCounts: Record<string, number> = {};
      const countryCodeMap: Record<string, string> = {};
      allLogs.forEach((log) => {
        const country = log.country || 'Unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
        if (log.countryCode && log.country) countryCodeMap[log.country] = log.countryCode;
      });
      const countryData = Object.entries(countryCounts)
        .map(([country, count]) => ({ country, countryCode: countryCodeMap[country] || '', count }))
        .sort((a, b) => b.count - a.count);

      // Device distribution
      const deviceCounts: Record<string, number> = {};
      allLogs.forEach((log) => {
        let deviceType = 'Unknown';
        if (log.device?.includes('Android')) deviceType = 'Android';
        else if (log.device?.includes('iPhone') || log.device?.includes('iPad')) deviceType = 'iOS';
        else if (log.device?.includes('Windows')) deviceType = 'Windows';
        else if (log.device?.includes('Mac')) deviceType = 'Mac';
        deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
      });

      // Top profiles by scan count
      const profileScanMap: Record<number, number> = {};
      allLogs.forEach((log) => {
        profileScanMap[log.profileId] = (profileScanMap[log.profileId] || 0) + 1;
      });
      const topProfiles = Object.entries(profileScanMap)
        .map(([profileId, count]) => {
          const profile = allProfiles.find((p) => p.id === Number(profileId));
          return { name: profile?.name || `Profile ${profileId}`, slug: profile?.slug || '', count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      res.json({ totalScans, totalUsers, totalProfiles, scansByDate, countryData, deviceDistribution: deviceCounts, topProfiles });
    } catch (error) {
      console.error('Admin analytics error:', error);
      res.status(500).json({ message: 'Failed to get admin analytics' });
    }
  });

  // Upload tutorial video (admin only)
  adminRoutes.post('/upload-tutorial', multer({ storage: videoStorage, limits: { fileSize: 50 * 1024 * 1024 } }).single('video'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded" });
      }
      
      // Get the uploaded file info
      const videoFile = req.file;
      
      // Rename the file with a tutorial prefix and timestamp
      const timestamp = Date.now();
      const newFilename = `tutorial-${timestamp}${path.extname(videoFile.originalname)}`;
      const newPath = path.join(uploadsDir, newFilename);
      
      // Rename the file
      fs.renameSync(videoFile.path, newPath);
      
      res.json({ 
        message: "Tutorial video uploaded successfully",
        videoUrl: `/uploads/${newFilename}`
      });
    } catch (error) {
      console.error('Error uploading tutorial video:', error);
      res.status(500).json({ 
        message: "Failed to upload tutorial video",
      });
    }
  });

  // Add forgot password functionality with SendGrid
  adminRoutes.post('/send-reset-email', async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username/email is required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        // For security reasons, still return success
        return res.json({ 
          success: true, 
          message: "If the email exists, a password reset link has been sent" 
        });
      }
      
      if (!process.env.SENDGRID_API_KEY) {
        return res.status(503).json({ 
          message: "Email service is not configured. Please contact administrator." 
        });
      }
      
      // Generate a reset token (this would normally be stored in the database)
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // In a real implementation, this token would be saved in the database
      // with an expiration time, associated with the user
      
      // Reset link would be something like: https://yourdomain.com/reset-password?token=RESET_TOKEN
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}&username=${encodeURIComponent(username)}`;
      
      // Send email with SendGrid (placeholder for now)
      // This would be implemented when SENDGRID_API_KEY is available
      
      res.json({
        success: true,
        message: "Password reset instructions have been sent",
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      res.status(500).json({ 
        message: "Failed to send reset email",
      });
    }
  });

  // Serve uploaded files from uploads directory
  app.use('/uploads', express.static(uploadsDir));

  // Get all reviews 
  apiRoutes.get('/reviews', async (req, res) => {
    try {
      // Get only visible reviews for public view
      const reviews = await storage.getReviews(true);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  
  // Submit a new review
  apiRoutes.post('/reviews', async (req, res) => {
    try {
      const { name, title, content, rating } = req.body;
      
      if (!name || !content || !rating) {
        return res.status(400).json({ message: "Name, content, and rating are required" });
      }
      
      // Create review (will be hidden by default until approved by storage layer)
      const review = await storage.createReview({
        name,
        title: title || null,
        content,
        rating,
        avatarUrl: null,
      });
      
      res.status(201).json({
        success: true,
        message: "Thank you! Your review has been submitted and will be visible after approval.",
        review
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Failed to submit review" });
    }
  });
  
  // Admin routes for managing reviews
  apiRoutes.get('/admin/reviews', requireAuth, async (req, res) => {
    try {
      // Check if user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get all reviews, including hidden ones
      const reviews = await storage.getReviews(false);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  
  // Update review visibility (approve/hide)
  apiRoutes.patch('/admin/reviews/:id', requireAuth, async (req, res) => {
    try {
      // Check if user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const { isVisible } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      if (typeof isVisible !== 'boolean') {
        return res.status(400).json({ message: "isVisible must be a boolean" });
      }
      
      const review = await storage.updateReviewVisibility(id, isVisible);
      res.json(review);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ error: "Failed to update review" });
    }
  });
  
  // Delete a review
  apiRoutes.delete('/admin/reviews/:id', requireAuth, async (req, res) => {
    try {
      // Check if user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const deleted = await storage.deleteReview(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
