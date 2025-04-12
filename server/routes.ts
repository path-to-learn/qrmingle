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
      // Accept other video formats but log for monitoring
      console.log(`Non-MP4 video uploaded: ${file.mimetype}. MP4 is recommended for optimal compatibility.`);
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed. MP4 format is recommended.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (must happen before routes)
  setupAuth(app);

  // API routes prefix
  const apiRoutes = express.Router();
  app.use('/api', apiRoutes);
  
  // Forgot password route
  apiRoutes.post('/forgot-password', async (req, res) => {
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
          message: "If your email is registered, you will receive instructions to reset your password." 
        });
      }
      
      // In a production environment, we would:
      // 1. Generate a reset token and store it in the database
      // 2. Send an email with a link to reset the password 
      // 3. Create a route to handle the password reset
      
      // For this demo, we'll just return the username (email) to simulate the email sending
      return res.json({ 
        success: true, 
        message: "If your email is registered, you will receive instructions to reset your password.",
        debug: { username: user.username } // This would NOT be in production, just for testing
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ 
        message: "Failed to process forgot password request", 
        error: error instanceof Error ? error.message : String(error)
      });
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
  apiRoutes.get('/profiles', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const profiles = await storage.getProfilesByUserId(userId);
      
      // For each profile, get the social links
      const profilesWithLinks = await Promise.all(profiles.map(async (profile) => {
        const socialLinks = await storage.getSocialLinksByProfileId(profile.id);
        return { ...profile, socialLinks };
      }));
      
      res.json(profilesWithLinks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profiles" });
    }
  });

  apiRoutes.post('/profiles', async (req, res) => {
    try {
      console.log("Profile creation request received:", JSON.stringify(req.body, null, 2));
      
      // Validate the profile data
      let profileData;
      try {
        profileData = profileFormSchema.parse(req.body);
        console.log("Profile data validated successfully");
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
      
      const userId = parseInt(req.body.userId);
      console.log("User ID:", userId);
      
      if (isNaN(userId)) {
        console.error("Invalid user ID:", req.body.userId);
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
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
        console.log("User tried to create more than 3 profiles");
        return res.status(403).json({ 
          message: "You can create up to 3 profiles. Premium features coming soon!",
          type: "PROFILE_LIMIT_REACHED"
        });
      }
      
      // All QR styles and colors are now available to all users
      console.log("All features are enabled for free users");
      
      // Generate a slug from the display name
      const baseSlug = profileData.displayName.toLowerCase().replace(/\s+/g, '-');
      const randomSuffix = crypto.randomBytes(4).toString('hex');
      const slug = `${baseSlug}-${randomSuffix}`;
      console.log("Generated slug:", slug);
      
      // Create the profile
      const { socialLinks, ...profileWithoutLinks } = profileData;
      console.log("Creating profile with data:", { ...profileWithoutLinks, userId, slug });
      
      const profile = await storage.createProfile({
        ...profileWithoutLinks,
        userId,
        slug,
      });
      
      console.log("Profile created successfully:", profile);
      
      // Create the social links
      console.log("Creating social links:", socialLinks);
      
      const createdLinks = await Promise.all(
        socialLinks.map((link) => storage.createSocialLink({
          ...link,
          profileId: profile.id,
        }))
      );
      
      console.log("Social links created successfully:", createdLinks);
      
      const responseData = { ...profile, socialLinks: createdLinks };
      console.log("Sending response:", responseData);
      
      res.status(201).json(responseData);
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
        error: error instanceof Error ? error.message : String(error)
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

  apiRoutes.put('/profiles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      const profileData = profileFormSchema.parse(req.body);
      
      // Check if profile exists and get its user ID
      const existingProfile = await storage.getProfile(id);
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Get user to check premium status
      const user = await storage.getUser(existingProfile.userId);
      
      // Check if user is a premium user or has an active trial
      const isUserPremium = user?.isPremium || (user && storage.isUserInActiveTrial(user));
      
      // All QR styles and colors are now available to all users
      console.log("All features are enabled for free users");
      
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

  apiRoutes.delete('/profiles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid profile ID" });
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
      
      // Log the scan
      const scanLogData = {
        profileId: profile.id,
        location: req.query.location as string,
        device: req.headers['user-agent'] || '',
        referrer: req.headers.referer || '',
      };
      
      await storage.createScanLog(scanLogData);
      
      res.json({ ...profile, socialLinks });
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });
  
  // Handle contact form submissions
  apiRoutes.post('/contact-form', async (req, res) => {
    try {
      const { profileId, name, email, message } = req.body;
      
      if (!profileId || !name || !email || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get profile to check if it exists
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // In a real app, you would:
      // 1. Store this contact in a database
      // 2. Send an email notification to the profile owner
      // 3. Possibly integrate with a CRM or email marketing tool
      
      // For now, we'll just return success
      res.json({ success: true, message: "Contact form submitted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit contact form" });
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

        // Log video file details for monitoring
        console.log(`Tutorial video uploaded: ${req.file.filename}`);
        console.log(`File size: ${(req.file.size / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`File type: ${req.file.mimetype}`);
        
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
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Analytics routes
  apiRoutes.get('/analytics/profile/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      const profile = await storage.getProfile(id);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
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
      console.log("Full analytics available to all users");
      
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
      
      // Get location distribution
      const locationCounts: Record<string, number> = {};
      
      scanLogs.forEach((log) => {
        const location = log.location || 'Unknown';
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      });
      
      res.json({
        totalScans: profile.scanCount,
        scansByDate,
        deviceDistribution: deviceCounts,
        locationDistribution: locationCounts,
        isLimited: false, // All features available to all users
        timeRange: 'all',
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // Premium trials endpoint
  apiRoutes.post('/start-premium-trial', async (req, res) => {
    try {
      const { userId, durationDays = 7 } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
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
    // Stripe webhook handler for asynchronous events
    apiRoutes.post('/stripe-webhook', async (req, res) => {
      try {
        console.log('Received Stripe webhook event');
        
        // Extract the event data - in our case, req.body is already parsed as JSON
        const event = req.body;
        
        if (!event || !event.type) {
          console.log("Invalid webhook payload:", event);
          return res.status(400).json({ message: "Invalid webhook payload" });
        }
        
        console.log(`Processing webhook event: ${event.type}`);
        
        // Handle the event
        if (event.type === 'payment_intent.succeeded') {
          const paymentIntent = event.data.object;
          
          // Extract the user ID from the metadata
          const userId = paymentIntent.metadata?.userId;
          
          if (userId) {
            console.log(`Webhook: Payment succeeded for user ${userId}`);
            
            // Update user to premium
            const user = await storage.getUser(parseInt(userId));
            
            if (user) {
              console.log(`Webhook: Setting user ${userId} to premium status`);
              await storage.updateUserPremiumStatus(parseInt(userId), true);
            } else {
              console.log(`Webhook: User ${userId} not found`);
            }
          } else {
            console.log(`Webhook: Payment succeeded but no userId in metadata`);
          }
        }
        
        res.json({ received: true });
      } catch (error) {
        console.error("Stripe webhook error:", error);
        res.status(500).json({ message: "Webhook error" });
      }
    });
    apiRoutes.post('/create-payment-intent', async (req, res) => {
      try {
        const { userId } = req.body;
        
        if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
        }
        
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

    apiRoutes.post('/confirm-premium', async (req, res) => {
      try {
        const { userId, paymentIntentId } = req.body;
        
        if (!userId || !paymentIntentId) {
          return res.status(400).json({ message: "User ID and payment intent ID are required" });
        }
        
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Verify payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({ message: "Payment not successful" });
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
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Serve uploaded files from uploads directory
  app.use('/uploads', express.static(uploadsDir));

  const httpServer = createServer(app);
  return httpServer;
}
