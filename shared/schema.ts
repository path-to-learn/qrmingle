import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  trialExpiresAt: timestamp("trial_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  title: text("title"),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  photoSize: integer("photo_size").default(120), // Photo size in pixels (width/height)
  backgroundUrl: text("background_url"), // Virtual background image URL
  backgroundOpacity: integer("background_opacity").default(100), // Background opacity 0-100
  cardColor: text("card_color").default("#ffffff"), // Profile card background color
  qrStyle: text("qr_style").default("basic"),
  qrColor: text("qr_color").default("#3B82F6"),
  qrSize: integer("qr_size").default(150),
  qrPosition: text("qr_position").default("bottom"), // top, bottom, left, right
  photoPosition: text("photo_position").default("top"), // top, left, right, hidden
  layoutStyle: text("layout_style").default("standard"), // standard, compact, centered, minimal
  shortBio: text("short_bio"),
  slug: text("slug").notNull().unique(),
  scanCount: integer("scan_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  // AR-related fields that exist in the current database
  hasArEnabled: boolean("has_ar_enabled").default(false),
  arModelUrl: text("ar_model_url"),
  arScale: integer("ar_scale").default(100),
  arAnimationEnabled: boolean("ar_animation_enabled").default(false),
});

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
});

export const scanLogs = pgTable("scan_logs", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  location: text("location"),
  country: text("country"),
  countryCode: text("country_code"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  referrer: text("referrer"),
  ipAddress: text("ip_address"),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title"), // Job title or company
  content: text("content").notNull(),
  avatarUrl: text("avatar_url"),
  rating: integer("rating").default(5), // 1-5 stars
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the session table structure for express-session with connect-pg-simple
export const sessions = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  token: text("token").primaryKey(),
  userId: integer("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isPremium: true,
  isAdmin: true,
  stripeCustomerId: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  userId: true,
  scanCount: true,
  createdAt: true,
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
});

export const insertScanLogSchema = createInsertSchema(scanLogs).omit({
  id: true,
  timestamp: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  isVisible: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;

export type InsertScanLog = z.infer<typeof insertScanLogSchema>;
export type ScanLog = typeof scanLogs.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Extended schemas for validation
export const profileFormSchema = insertProfileSchema.extend({
  // Ensure slug is optional in the form schema since it's generated on the server
  slug: z.string().optional(),
  
  // Ensure these fields have default values if they're null or undefined
  photoUrl: z.string().nullable().default(""),
  photoSize: z.number().min(60).max(300).default(120),
  backgroundUrl: z.string().nullable().default(""),
  backgroundOpacity: z.number().min(0).max(100).default(100),
  cardColor: z.string().default("#ffffff"),
  title: z.string().nullable().default(""),
  bio: z.string().nullable().default(""),
  qrStyle: z.string().default("basic"),
  qrColor: z.string().default("#3B82F6"),
  qrSize: z.number().default(150),
  qrPosition: z.enum(["top", "bottom", "left", "right"]).default("bottom"),
  photoPosition: z.enum(["top", "left", "right", "hidden"]).default("top"),
  layoutStyle: z.enum(["standard", "compact", "centered", "minimal"]).default("standard"),
  
  // Ensure social links are an array with at least one entry
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1, "Platform is required"),
      url: z.string().min(1, "URL or contact info is required"),
    })
  ).min(1, "At least one social link is required").default([{ platform: "LinkedIn", url: "" }]),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
