import express from "express";
import crypto from "crypto";
import { z } from "zod";
import geoip from "geoip-lite";
import { storage } from "../storage";
import { profileFormSchema } from "@shared/schema";
import { requireAuth } from "../middleware";
import { checkIsPremium, getVisitorIp } from "../lib/premium";

export const profilesRouter = express.Router();

// List authenticated user's profiles
profilesRouter.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profiles = await storage.getProfilesByUserId(userId);
    const profilesWithLinks = await Promise.all(
      profiles.map(async (profile: any) => {
        const socialLinks = await storage.getSocialLinksByProfileId(profile.id);
        return { ...profile, socialLinks };
      })
    );
    res.json(profilesWithLinks);
  } catch {
    res.status(500).json({ message: "Failed to get profiles" });
  }
});

// Create profile
profilesRouter.post("/", requireAuth, async (req, res) => {
  try {
    let profileData;
    try {
      profileData = profileFormSchema.parse(req.body);
    } catch (validationError) {
      console.error("Profile validation failed:", validationError);
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", details: validationError.errors });
      }
      throw validationError;
    }

    const userId = req.user!.id;
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isUserPremium = checkIsPremium(user);
    const profileLimit = isUserPremium ? 5 : 2;
    const userProfiles = await storage.getProfilesByUserId(userId);

    if (userProfiles.length >= profileLimit) {
      return res.status(403).json({
        message: isUserPremium
          ? "You have reached the maximum of 5 profiles."
          : "Free accounts can have up to 2 profiles. Upgrade to Premium for up to 5.",
        type: "PROFILE_LIMIT_REACHED",
      });
    }

    const baseSlug = profileData.displayName.toLowerCase().replace(/\s+/g, "-");
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const slug = `${baseSlug}-${randomSuffix}`;

    const { socialLinks, ...profileWithoutLinks } = profileData;
    const profile = await storage.createProfile({ ...profileWithoutLinks, userId, slug });
    const createdLinks = await Promise.all(
      socialLinks.map((link) => storage.createSocialLink({ ...link, profileId: profile.id }))
    );

    res.status(201).json({ ...profile, socialLinks: createdLinks });
  } catch (error) {
    console.error("Profile creation error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", details: error.errors });
    }
    res.status(500).json({ message: "Failed to create profile" });
  }
});

// Get single profile by id
profilesRouter.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid profile ID" });

    const profile = await storage.getProfile(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const socialLinks = await storage.getSocialLinksByProfileId(profile.id);
    res.json({ ...profile, socialLinks });
  } catch {
    res.status(500).json({ message: "Failed to get profile" });
  }
});

// Update profile
profilesRouter.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid profile ID" });

    const profileData = profileFormSchema.parse(req.body);
    const existingProfile = await storage.getProfile(id);
    if (!existingProfile) return res.status(404).json({ message: "Profile not found" });
    if (existingProfile.userId !== req.user!.id)
      return res.status(403).json({ message: "Not authorized to update this profile" });

    const { socialLinks, ...profileWithoutLinks } = profileData;
    const profile = await storage.updateProfile(id, profileWithoutLinks);
    await storage.deleteSocialLinksByProfileId(id);
    const createdLinks = await Promise.all(
      socialLinks.map((link) => storage.createSocialLink({ ...link, profileId: profile.id }))
    );

    res.json({ ...profile, socialLinks: createdLinks });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: error.message });
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Delete profile
profilesRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid profile ID" });

    const profile = await storage.getProfile(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.userId !== req.user!.id)
      return res.status(403).json({ message: "Not authorized to delete this profile" });

    const deleted = await storage.deleteProfile(id);
    if (!deleted) return res.status(404).json({ message: "Profile not found" });

    res.status(204).end();
  } catch {
    res.status(500).json({ message: "Failed to delete profile" });
  }
});

// Public profile by slug — logs the scan
profilesRouter.get("/p/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const profile = await storage.getProfileBySlug(slug);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const socialLinks = await storage.getSocialLinksByProfileId(profile.id);
    const userAgent = req.headers["user-agent"] || "";

    let deviceInfo = "Unknown";
    let browserInfo = "Unknown";
    let osInfo = "Unknown";

    if (userAgent) {
      if (userAgent.includes("iPhone")) deviceInfo = "iPhone";
      else if (userAgent.includes("iPad")) deviceInfo = "iPad";
      else if (userAgent.includes("Android")) deviceInfo = "Android";
      else if (userAgent.includes("Windows Phone")) deviceInfo = "Windows Phone";
      else if (userAgent.includes("Windows")) deviceInfo = "Desktop";
      else if (userAgent.includes("Mac")) deviceInfo = "Mac";
      else if (userAgent.includes("Linux")) deviceInfo = "Linux";

      if (userAgent.includes("Chrome")) browserInfo = "Chrome";
      else if (userAgent.includes("Firefox")) browserInfo = "Firefox";
      else if (userAgent.includes("Safari")) browserInfo = "Safari";
      else if (userAgent.includes("Edge")) browserInfo = "Edge";
      else if (userAgent.includes("MSIE") || userAgent.includes("Trident/"))
        browserInfo = "Internet Explorer";

      if (userAgent.includes("Windows NT 10.0")) osInfo = "Windows 10";
      else if (userAgent.includes("Mac OS X")) osInfo = "macOS";
      else if (userAgent.includes("Android")) osInfo = "Android";
      else if (userAgent.includes("iOS")) osInfo = "iOS";
      else if (userAgent.includes("Linux")) osInfo = "Linux";
    }

    const visitorIp = getVisitorIp(req);
    const geo = geoip.lookup(visitorIp);

    await storage.createScanLog({
      profileId: profile.id,
      location: req.query.location as string,
      country: geo?.country || (req.query.country as string) || "Unknown",
      countryCode: geo?.country || (req.query.countryCode as string) || "",
      city: geo?.city || (req.query.city as string) || "",
      device: deviceInfo,
      browser: browserInfo,
      os: osInfo,
      referrer: req.headers.referer || "",
      ipAddress: visitorIp,
    });

    res.json({ ...profile, socialLinks });
  } catch (error) {
    console.error("Failed to get profile:", error);
    res.status(500).json({ message: "Failed to get profile" });
  }
});
