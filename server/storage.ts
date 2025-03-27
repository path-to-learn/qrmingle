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

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPremiumStatus(id: number, isPremium: boolean): Promise<User>;
  updateUserStripeCustomerId(id: number, stripeCustomerId: string): Promise<User>;

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profiles: Map<number, Profile>;
  private socialLinks: Map<number, SocialLink>;
  private scanLogs: Map<number, ScanLog>;
  private userCurrentId: number;
  private profileCurrentId: number;
  private socialLinkCurrentId: number;
  private scanLogCurrentId: number;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.socialLinks = new Map();
    this.scanLogs = new Map();
    this.userCurrentId = 1;
    this.profileCurrentId = 1;
    this.socialLinkCurrentId = 1;
    this.scanLogCurrentId = 1;

    // Create a sample user
    this.createUser({
      username: "demo",
      password: "password",
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = {
      ...insertUser,
      id,
      isPremium: false,
      stripeCustomerId: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPremiumStatus(id: number, isPremium: boolean): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = { ...user, isPremium };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeCustomerId(id: number, stripeCustomerId: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = { ...user, stripeCustomerId };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Profile methods
  async getProfile(id: number): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileBySlug(slug: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.slug === slug,
    );
  }

  async getProfilesByUserId(userId: number): Promise<Profile[]> {
    return Array.from(this.profiles.values()).filter(
      (profile) => profile.userId === userId,
    );
  }

  async createProfile(profile: InsertProfile & { userId: number }): Promise<Profile> {
    const id = this.profileCurrentId++;
    const now = new Date();
    
    const newProfile: Profile = {
      ...profile,
      id,
      scanCount: 0,
      createdAt: now,
    };
    
    this.profiles.set(id, newProfile);
    return newProfile;
  }

  async updateProfile(id: number, profileData: Partial<InsertProfile>): Promise<Profile> {
    const profile = await this.getProfile(id);
    if (!profile) {
      throw new Error(`Profile with id ${id} not found`);
    }

    const updatedProfile: Profile = { ...profile, ...profileData };
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async deleteProfile(id: number): Promise<boolean> {
    const profile = await this.getProfile(id);
    if (!profile) {
      return false;
    }

    // Delete related social links
    await this.deleteSocialLinksByProfileId(id);
    
    // Delete profile
    return this.profiles.delete(id);
  }

  async incrementScanCount(id: number): Promise<Profile> {
    const profile = await this.getProfile(id);
    if (!profile) {
      throw new Error(`Profile with id ${id} not found`);
    }

    const updatedProfile = { ...profile, scanCount: profile.scanCount + 1 };
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Social link methods
  async getSocialLinksByProfileId(profileId: number): Promise<SocialLink[]> {
    return Array.from(this.socialLinks.values()).filter(
      (link) => link.profileId === profileId,
    );
  }

  async createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink> {
    const id = this.socialLinkCurrentId++;
    
    const newSocialLink: SocialLink = {
      ...socialLink,
      id,
    };
    
    this.socialLinks.set(id, newSocialLink);
    return newSocialLink;
  }

  async updateSocialLink(id: number, socialLinkData: Partial<InsertSocialLink>): Promise<SocialLink> {
    const socialLink = this.socialLinks.get(id);
    if (!socialLink) {
      throw new Error(`Social link with id ${id} not found`);
    }

    const updatedSocialLink: SocialLink = { ...socialLink, ...socialLinkData };
    this.socialLinks.set(id, updatedSocialLink);
    return updatedSocialLink;
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    return this.socialLinks.delete(id);
  }

  async deleteSocialLinksByProfileId(profileId: number): Promise<boolean> {
    const links = await this.getSocialLinksByProfileId(profileId);
    
    links.forEach((link) => {
      this.socialLinks.delete(link.id);
    });
    
    return true;
  }

  // Scan log methods
  async getScanLogsByProfileId(profileId: number): Promise<ScanLog[]> {
    return Array.from(this.scanLogs.values())
      .filter((log) => log.profileId === profileId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createScanLog(scanLogData: InsertScanLog): Promise<ScanLog> {
    const id = this.scanLogCurrentId++;
    const now = new Date();
    
    const scanLog: ScanLog = {
      ...scanLogData,
      id,
      timestamp: now,
    };
    
    this.scanLogs.set(id, scanLog);

    // Increment scan count for the profile
    await this.incrementScanCount(scanLogData.profileId);
    
    return scanLog;
  }
}

export const storage = new MemStorage();
