import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
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
  qrStyle: text("qr_style").default("basic"),
  qrColor: text("qr_color").default("#3B82F6"),
  qrSize: integer("qr_size").default(150),
  qrPosition: text("qr_position").default("bottom"), // top, bottom, left, right
  photoPosition: text("photo_position").default("top"), // top, left, right, hidden
  layoutStyle: text("layout_style").default("standard"), // standard, compact, centered, minimal
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

// Define the session table structure for express-session with connect-pg-simple
export const sessions = pgTable("session", {
  sid: text("sid").notNull(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.sid] }),
  };
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
