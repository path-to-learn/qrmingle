import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertScanLogSchema, insertUserSchema, profileFormSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import Stripe from "stripe";

// Initialize Stripe if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" as any }) 
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRoutes = express.Router();
  app.use('/api', apiRoutes);

  // User authentication routes
  apiRoutes.post('/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Create the user
      const user = await storage.createUser(userData);
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  apiRoutes.post('/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log("Login attempt for user:", username);
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log("User not found:", username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      if (user.password !== password) {
        console.log("Password mismatch for user:", username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      console.log("Login successful for user:", username);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });
  
  // Session validation endpoint
  apiRoutes.get('/auth/validate', async (req, res) => {
    try {
      const userId = req.query.userId;
      
      // If we don't have a userId, return unauthorized
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get the user by ID
      const user = await storage.getUser(Number(userId));
      
      // If user doesn't exist, return unauthorized
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Auth validation error:", error);
      res.status(500).json({ message: "Failed to validate authentication" });
    }
  });

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
      
      // Check if user is allowed to use premium features
      const premiumStyles = ['bordered', 'gradient', 'rounded', 'shadow'];
      if (profileData.qrStyle && premiumStyles.includes(profileData.qrStyle)) {
        const user = await storage.getUser(userId);
        if (!user?.isPremium) {
          console.log("Non-premium user tried to use premium style, defaulting to basic");
          profileData.qrStyle = 'basic';
        }
      }
      
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
      
      // Check if user is allowed to use premium features
      const premiumStyles = ['bordered', 'gradient', 'rounded', 'shadow'];
      if (profileData.qrStyle && premiumStyles.includes(profileData.qrStyle)) {
        const user = await storage.getUser(existingProfile.userId);
        if (!user?.isPremium) {
          profileData.qrStyle = 'basic';
        }
      }
      
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
      
      const scanLogs = await storage.getScanLogsByProfileId(id);
      
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
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // User premium upgrade with Stripe
  if (stripe) {
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
          amount: 1999, // $19.99
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

  const httpServer = createServer(app);
  return httpServer;
}
