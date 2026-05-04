import express from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware";
import { checkIsPremium } from "../lib/premium";

export const analyticsRouter = express.Router();

analyticsRouter.get("/profile/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid profile ID" });

    const profile = await storage.getProfile(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.userId !== req.user!.id)
      return res.status(403).json({ message: "Not authorized to view this profile's analytics" });

    const user = await storage.getUser(profile.userId);
    const isUserPremium = user ? checkIsPremium(user) : false;

    if (!isUserPremium) {
      return res.json({
        totalScans: profile.scanCount,
        scansByDate: {},
        deviceDistribution: {},
        locationDistribution: {},
        countryDistribution: {},
        countryData: [],
        isLimited: true,
      });
    }

    const scanLogs = await storage.getScanLogsByProfileId(id);

    const scansByDate: Record<string, number> = {};
    scanLogs.forEach((log) => {
      if (log.timestamp) {
        const date = log.timestamp.toISOString().split("T")[0];
        scansByDate[date] = (scansByDate[date] || 0) + 1;
      }
    });

    const deviceCounts: Record<string, number> = {};
    scanLogs.forEach((log) => {
      let deviceType = "Unknown";
      if (log.device?.includes("Android")) deviceType = "Android";
      else if (log.device?.includes("iPhone") || log.device?.includes("iPad")) deviceType = "iOS";
      else if (log.device?.includes("Windows")) deviceType = "Windows";
      else if (log.device?.includes("Mac")) deviceType = "Mac";
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
    });

    const locationCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const countryCodeMap: Record<string, string> = {};

    scanLogs.forEach((log) => {
      const location = log.location || "Unknown";
      locationCounts[location] = (locationCounts[location] || 0) + 1;
      const country = log.country || "Unknown";
      countryCounts[country] = (countryCounts[country] || 0) + 1;
      if (log.countryCode && log.country) countryCodeMap[log.country] = log.countryCode;
    });

    const countryData = Object.entries(countryCounts).map(([country, count]) => ({
      country,
      countryCode: countryCodeMap[country] || "",
      visitors: count,
    }));

    res.json({
      totalScans: profile.scanCount,
      scansByDate,
      deviceDistribution: deviceCounts,
      locationDistribution: locationCounts,
      countryDistribution: countryCounts,
      countryData,
      isLimited: false,
      timeRange: "all",
    });
  } catch {
    res.status(500).json({ message: "Failed to get analytics" });
  }
});
