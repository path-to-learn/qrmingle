import {
  User,
  InsertUser,
  Profile,
  InsertProfile,
  SocialLink,
  InsertSocialLink,
  ScanLog,
  InsertScanLog,
} from "@shared/schema";
import "dotenv/config";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import pg from "pg";
import { parse as parsePgUrl } from "pg-connection-string";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, newPassword: string): Promise<User>;
  updateUserPremiumStatus(id: number, isPremium: boolean): Promise<User>;
  updateUserAdminStatus(id: number, isAdmin: boolean): Promise<User>;
  updateUserStripeCustomerId(id: number, stripeCustomerId: string): Promise<User>;
  startPremiumTrial(id: number, durationDays: number): Promise<User>;
  isUserInActiveTrial(user: User): boolean;

  // Profile methods
  getProfile(id: number): Promise<Profile | undefined>;
  getProfileBySlug(slug: string): Promise<Profile | undefined>;
  getProfilesByUserId(userId: number): Promise<Profile[]>;
  createProfile(profile: InsertProfile & { userId: number }): Promise<Profile>;
  updateProfile(id: number, profile: Partial<InsertProfile>): Promise<Profile>;
  deleteProfile(id: number): Promise<boolean>;
  incrementScanCount(id: number): Promise<Profile>;

  // Social link methods
  getSocialLinksByProfileId(profileId: number): Promise<SocialLink[]>;
  createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: number, socialLink: Partial<InsertSocialLink>): Promise<SocialLink>;
  deleteSocialLink(id: number): Promise<boolean>;
  deleteSocialLinksByProfileId(profileId: number): Promise<boolean>;

  // Scan log methods
  getScanLogsByProfileId(profileId: number): Promise<ScanLog[]>;
  createScanLog(scanLog: InsertScanLog): Promise<ScanLog>;
  
  // Review methods
  getReviews(onlyVisible?: boolean): Promise<import('@shared/schema').Review[]>;
  createReview(review: import('@shared/schema').InsertReview): Promise<import('@shared/schema').Review>;
  updateReviewVisibility(id: number, isVisible: boolean): Promise<import('@shared/schema').Review>;
  deleteReview(id: number): Promise<boolean>;
  
  // Contact message methods
  getContactMessagesByProfileId(profileId: number): Promise<import('@shared/schema').ContactMessage[]>;
  createContactMessage(message: import('@shared/schema').InsertContactMessage): Promise<import('@shared/schema').ContactMessage>;
  markContactMessageAsRead(id: number): Promise<import('@shared/schema').ContactMessage>;
  deleteContactMessage(id: number): Promise<boolean>;
  
  // Password reset token methods
  createPasswordResetToken(token: string, userId: number, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ userId: number; expiresAt: Date } | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;

  // Account deletion
  deleteUser(id: number): Promise<boolean>;

  // AI assist tracking
  incrementAiAssistCount(userId: number): Promise<void>;

  // Admin analytics methods
  getAllUsers(): Promise<User[]>;
  getAllProfiles(): Promise<Profile[]>;
  getAllScanLogs(): Promise<ScanLog[]>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    const PostgresStore = connectPgSimple(session);
    // Parse DATABASE_URL into individual components so that PGHOST,
    // PGUSER, PGPASSWORD and other PG* env vars are completely ignored.
    // pg.Pool prioritises explicit config options over env vars.
    // Prefer NEON_DATABASE_URL — DATABASE_URL is runtime-managed by Replit
    // and resolves to the internal helium host in production deployments.
    const dbUrl = (process.env.NEON_DATABASE_URL || process.env.DATABASE_URL)!;
    const parsed = parsePgUrl(dbUrl);
    const pool = new pg.Pool({
      host:     parsed.host     ?? undefined,
      port:     parsed.port     ? Number(parsed.port) : 5432,
      user:     parsed.user     ?? undefined,
      password: parsed.password ?? undefined,
      database: parsed.database ?? undefined,
      ssl: dbUrl.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    });
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
    
    // Check for demo user and create if not exists
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      // Check if demo user exists, create if not
      const demoUser = await this.getUserByUsername("demo");
      if (!demoUser) {
        console.log("Creating demo user...");
        await this.createUser({
          username: "demo",
          password: "demo",
        });
      }
    } catch (error) {
      console.error("Failed to initialize database storage:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { db, eq } = await import('./db');
    const { users } = await import('@shared/schema');
    
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { db, eq } = await import('./db');
    const { users } = await import('@shared/schema');
    
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    
    const [user] = await db.insert(users).values({
      ...insertUser,
      isPremium: false,
      isAdmin: false, // Default to non-admin
      trialExpiresAt: null,
      stripeCustomerId: null,
    }).returning();
    
    return user;
  }

  async updateUserPassword(id: number, newPassword: string): Promise<User> {
    const { db, eq } = await import('./db');
    const { users } = await import('@shared/schema');
    const { scrypt, randomBytes } = await import('crypto');
    const { promisify } = await import('util');
    
    // Hash the new password
    const scryptAsync = promisify(scrypt);
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(newPassword, salt, 64)) as Buffer;
    const hashedPassword = `${buf.toString("hex")}.${salt}`;
    
    // Update the user's password
    const [updatedUser] = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }

  async updateUserPremiumStatus(id: number, isPremium: boolean): Promise<User> {
    const { db, eq } = await import('./db');
    const { users } = await import('@shared/schema');
    
    const [updatedUser] = await db.update(users)
      .set({ isPremium })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }

  async updateUserAdminStatus(id: number, isAdmin: boolean): Promise<User> {
    const { db, eq } = await import('./db');
    const { users } = await import('@shared/schema');
    
    const [updatedUser] = await db.update(users)
      .set({ isAdmin })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }

  async updateUserStripeCustomerId(id: number, stripeCustomerId: string): Promise<User> {
    const { db, eq } = await import('./db');
    const { users } = await import('@shared/schema');
    
    const [updatedUser] = await db.update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }

  async startPremiumTrial(id: number, durationDays: number): Promise<User> {
    const { db, eq } = await import('./db');
    const { users } = await import('@shared/schema');
    
    // Calculate trial expiry date
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + durationDays);
    
    const [updatedUser] = await db.update(users)
      .set({ trialExpiresAt })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }

  isUserInActiveTrial(user: User): boolean {
    if (!user || !user.trialExpiresAt) {
      return false;
    }

    const now = new Date();
    const trialExpiresAt = typeof user.trialExpiresAt === 'string' 
      ? new Date(user.trialExpiresAt) 
      : user.trialExpiresAt;
    
    return now < trialExpiresAt;
  }

  // Profile methods
  async getProfile(id: number): Promise<Profile | undefined> {
    const { db, eq } = await import('./db');
    const { profiles } = await import('@shared/schema');
    
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async getProfileBySlug(slug: string): Promise<Profile | undefined> {
    const { db, eq } = await import('./db');
    const { profiles } = await import('@shared/schema');
    
    const [profile] = await db.select().from(profiles).where(eq(profiles.slug, slug));
    return profile;
  }

  async getProfilesByUserId(userId: number): Promise<Profile[]> {
    const { db, eq } = await import('./db');
    const { profiles } = await import('@shared/schema');
    
    return await db.select().from(profiles).where(eq(profiles.userId, userId));
  }

  async createProfile(profile: InsertProfile & { userId: number }): Promise<Profile> {
    const { db } = await import('./db');
    const { profiles } = await import('@shared/schema');
    
    const now = new Date();
    
    const [newProfile] = await db.insert(profiles).values({
      ...profile,
      scanCount: 0,
      createdAt: now,
    }).returning();
    
    return newProfile;
  }

  async updateProfile(id: number, profileData: Partial<InsertProfile>): Promise<Profile> {
    const { db, eq } = await import('./db');
    const { profiles } = await import('@shared/schema');
    
    const [updatedProfile] = await db.update(profiles)
      .set(profileData)
      .where(eq(profiles.id, id))
      .returning();
    
    if (!updatedProfile) {
      throw new Error(`Profile with id ${id} not found`);
    }
    
    return updatedProfile;
  }

  async deleteProfile(id: number): Promise<boolean> {
    const { db, eq } = await import('./db');
    const { profiles } = await import('@shared/schema');
    
    // Delete related social links
    await this.deleteSocialLinksByProfileId(id);
    
    // Delete profile
    const result = await db.delete(profiles).where(eq(profiles.id, id)).returning();
    return result.length > 0;
  }

  async incrementScanCount(id: number): Promise<Profile> {
    const { db, eq, sql } = await import('./db');
    const { profiles } = await import('@shared/schema');
    
    const [updatedProfile] = await db.update(profiles)
      .set({ 
        scanCount: sql`${profiles.scanCount} + 1` 
      })
      .where(eq(profiles.id, id))
      .returning();
    
    if (!updatedProfile) {
      throw new Error(`Profile with id ${id} not found`);
    }
    
    return updatedProfile;
  }

  // Social link methods
  async getSocialLinksByProfileId(profileId: number): Promise<SocialLink[]> {
    const { db, eq } = await import('./db');
    const { socialLinks } = await import('@shared/schema');
    
    return await db.select()
      .from(socialLinks)
      .where(eq(socialLinks.profileId, profileId));
  }

  async createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink> {
    const { db } = await import('./db');
    const { socialLinks } = await import('@shared/schema');
    
    const [newSocialLink] = await db.insert(socialLinks)
      .values(socialLink)
      .returning();
    
    return newSocialLink;
  }

  async updateSocialLink(id: number, socialLinkData: Partial<InsertSocialLink>): Promise<SocialLink> {
    const { db, eq } = await import('./db');
    const { socialLinks } = await import('@shared/schema');
    
    const [updatedSocialLink] = await db.update(socialLinks)
      .set(socialLinkData)
      .where(eq(socialLinks.id, id))
      .returning();
    
    if (!updatedSocialLink) {
      throw new Error(`Social link with id ${id} not found`);
    }
    
    return updatedSocialLink;
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    const { db, eq } = await import('./db');
    const { socialLinks } = await import('@shared/schema');
    
    const result = await db.delete(socialLinks)
      .where(eq(socialLinks.id, id))
      .returning();
    
    return result.length > 0;
  }

  async deleteSocialLinksByProfileId(profileId: number): Promise<boolean> {
    const { db, eq } = await import('./db');
    const { socialLinks } = await import('@shared/schema');
    
    const result = await db.delete(socialLinks)
      .where(eq(socialLinks.profileId, profileId))
      .returning();
    
    return true;
  }

  // Scan log methods
  async getScanLogsByProfileId(profileId: number): Promise<ScanLog[]> {
    const { db, eq, desc } = await import('./db');
    const { scanLogs } = await import('@shared/schema');
    
    return await db.select()
      .from(scanLogs)
      .where(eq(scanLogs.profileId, profileId))
      .orderBy(desc(scanLogs.timestamp));
  }

  async createScanLog(scanLogData: InsertScanLog): Promise<ScanLog> {
    const { db } = await import('./db');
    const { scanLogs } = await import('@shared/schema');
    
    const now = new Date();
    
    const [scanLog] = await db.insert(scanLogs).values({
      ...scanLogData,
      timestamp: now,
    }).returning();
    
    // Increment scan count for the profile
    await this.incrementScanCount(scanLogData.profileId);
    
    return scanLog;
  }
  
  // Review methods
  async getReviews(onlyVisible: boolean = false): Promise<import('@shared/schema').Review[]> {
    const { db, eq, desc } = await import('./db');
    const { reviews } = await import('@shared/schema');
    
    if (onlyVisible) {
      return await db.select()
        .from(reviews)
        .where(eq(reviews.isVisible, true))
        .orderBy(desc(reviews.createdAt));
    } else {
      return await db.select()
        .from(reviews)
        .orderBy(desc(reviews.createdAt));
    }
  }
  
  async createReview(reviewData: import('@shared/schema').InsertReview): Promise<import('@shared/schema').Review> {
    const { db } = await import('./db');
    const { reviews } = await import('@shared/schema');
    
    const now = new Date();
    
    // By default, new reviews are not visible until approved by admin
    const [review] = await db.insert(reviews).values({
      ...reviewData,
      isVisible: false,
      createdAt: now,
    }).returning();
    
    return review;
  }
  
  async updateReviewVisibility(id: number, isVisible: boolean): Promise<import('@shared/schema').Review> {
    const { db, eq } = await import('./db');
    const { reviews } = await import('@shared/schema');
    
    const [updatedReview] = await db.update(reviews)
      .set({ isVisible })
      .where(eq(reviews.id, id))
      .returning();
    
    if (!updatedReview) {
      throw new Error(`Review with id ${id} not found`);
    }
    
    return updatedReview;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    const { db, eq } = await import('./db');
    const { reviews } = await import('@shared/schema');
    
    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }
  
  // Contact message methods
  async getContactMessagesByProfileId(profileId: number): Promise<import('@shared/schema').ContactMessage[]> {
    const { db, eq, desc } = await import('./db');
    const { contactMessages } = await import('@shared/schema');
    
    return await db.select()
      .from(contactMessages)
      .where(eq(contactMessages.profileId, profileId))
      .orderBy(desc(contactMessages.createdAt));
  }
  
  async createContactMessage(messageData: import('@shared/schema').InsertContactMessage): Promise<import('@shared/schema').ContactMessage> {
    const { db } = await import('./db');
    const { contactMessages } = await import('@shared/schema');
    
    const now = new Date();
    
    const [message] = await db.insert(contactMessages).values({
      ...messageData,
      isRead: false,
      createdAt: now,
    }).returning();
    
    return message;
  }
  
  async markContactMessageAsRead(id: number): Promise<import('@shared/schema').ContactMessage> {
    const { db, eq } = await import('./db');
    const { contactMessages } = await import('@shared/schema');
    
    const [updatedMessage] = await db.update(contactMessages)
      .set({ isRead: true })
      .where(eq(contactMessages.id, id))
      .returning();
    
    if (!updatedMessage) {
      throw new Error(`Contact message with id ${id} not found`);
    }
    
    return updatedMessage;
  }
  
  async deleteContactMessage(id: number): Promise<boolean> {
    const { db, eq } = await import('./db');
    const { contactMessages } = await import('@shared/schema');
    
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id)).returning();
    return result.length > 0;
  }

  // Password reset token methods
  async createPasswordResetToken(token: string, userId: number, expiresAt: Date): Promise<void> {
    const { db } = await import('./db');
    const { passwordResetTokens } = await import('@shared/schema');
    await db.insert(passwordResetTokens).values({ token, userId, expiresAt });
  }

  async getPasswordResetToken(token: string): Promise<{ userId: number; expiresAt: Date } | undefined> {
    const { db, eq } = await import('./db');
    const { passwordResetTokens } = await import('@shared/schema');
    const [row] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return row;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    const { db, eq } = await import('./db');
    const { passwordResetTokens } = await import('@shared/schema');
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async deleteUser(id: number): Promise<boolean> {
    const { db, eq } = await import('./db');
    const { users, profiles, socialLinks, scanLogs, contactMessages, passwordResetTokens } = await import('@shared/schema');

    // Delete password reset tokens
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, id));

    // Get all profiles for cascading deletes
    const userProfiles = await db.select().from(profiles).where(eq(profiles.userId, id));
    for (const profile of userProfiles) {
      await db.delete(scanLogs).where(eq(scanLogs.profileId, profile.id));
      await db.delete(contactMessages).where(eq(contactMessages.profileId, profile.id));
      await db.delete(socialLinks).where(eq(socialLinks.profileId, profile.id));
    }
    await db.delete(profiles).where(eq(profiles.userId, id));

    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // AI assist tracking
  async incrementAiAssistCount(userId: number): Promise<void> {
    const { db, eq } = await import('./db');
    const { users } = await import('@shared/schema');
    const { sql } = await import('drizzle-orm');
    await db.update(users)
      .set({ aiAssistCount: sql`${users.aiAssistCount} + 1` })
      .where(eq(users.id, userId));
  }

  // Admin analytics methods
  async getAllUsers(): Promise<User[]> {
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    
    return await db.select().from(users);
  }
  
  async getAllProfiles(): Promise<Profile[]> {
    const { db } = await import('./db');
    const { profiles } = await import('@shared/schema');
    
    return await db.select().from(profiles);
  }
  
  async getAllScanLogs(): Promise<ScanLog[]> {
    const { db } = await import('./db');
    const { scanLogs } = await import('@shared/schema');
    
    return await db.select().from(scanLogs);
  }
}

export const storage = new DatabaseStorage();