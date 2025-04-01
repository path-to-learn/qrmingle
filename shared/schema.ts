import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isPremium: boolean("is_premium").default(false),
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
  qrStyle: text("qr_style").default("basic"),
  qrColor: text("qr_color").default("#3B82F6"),
  slug: text("slug").notNull().unique(),
  scanCount: integer("scan_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
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
  device: text("device"),
  referrer: text("referrer"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isPremium: true,
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;

export type InsertScanLog = z.infer<typeof insertScanLogSchema>;
export type ScanLog = typeof scanLogs.$inferSelect;

// Extended schemas for validation
export const profileFormSchema = insertProfileSchema.extend({
  // Ensure slug is optional in the form schema since it's generated on the server
  slug: z.string().optional(),
  
  // Ensure these fields have default values if they're null or undefined
  photoUrl: z.string().nullable().default(""),
  title: z.string().nullable().default(""),
  bio: z.string().nullable().default(""),
  qrStyle: z.string().default("basic"),
  qrColor: z.string().default("#3B82F6"),
  
  // Ensure social links are an array with at least one entry
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1, "Platform is required"),
      url: z.string().min(1, "URL or contact info is required"),
    })
  ).min(1, "At least one social link is required").default([{ platform: "LinkedIn", url: "" }]),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
