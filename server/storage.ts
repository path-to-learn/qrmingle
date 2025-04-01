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
    // Initialize with empty data
    this.users = new Map();
    this.profiles = new Map();
    this.socialLinks = new Map();
    this.scanLogs = new Map();
    this.userCurrentId = 1;
    this.profileCurrentId = 1;
    this.socialLinkCurrentId = 1;
    this.scanLogCurrentId = 1;

    // Try to load data from storage
    this.initializeStorage();
  }

  // Initialize storage asynchronously
  private async initializeStorage() {
    try {
      await this.loadFromStorage();
      
      // Create a demo user if no users exist
      if (this.users.size === 0) {
        console.log("Creating demo user...");
        await this.createUser({
          username: "demo",
          password: "demo",
        });
      }
    } catch (error) {
      console.error("Failed to initialize storage:", error);
    }
  }

  // Save all data to a JSON file
  private async saveToStorage() {
    try {
      const data = {
        users: Array.from(this.users.entries()),
        profiles: Array.from(this.profiles.entries()),
        socialLinks: Array.from(this.socialLinks.entries()),
        scanLogs: Array.from(this.scanLogs.entries()),
        userCurrentId: this.userCurrentId,
        profileCurrentId: this.profileCurrentId,
        socialLinkCurrentId: this.socialLinkCurrentId,
        scanLogCurrentId: this.scanLogCurrentId,
      };

      // Save to file using node fs
      import('fs/promises').then(async fs => {
        await fs.writeFile('./data-store.json', JSON.stringify(data, (key, value) => {
          // Convert Date objects to ISO strings
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        }, 2));
        
        console.log("Data saved to storage");
      }).catch(err => {
        console.error("Error importing fs module:", err);
      });
    } catch (error) {
      console.error("Failed to save data to storage:", error);
    }
  }

  // Load data from a JSON file
  private async loadFromStorage() {
    try {
      const fs = await import('fs/promises');
      const fsSync = await import('fs');
      
      if (!fsSync.existsSync('./data-store.json')) {
        console.log("No data store found. Starting with empty data.");
        return;
      }
      
      const fileContent = await fs.readFile('./data-store.json', 'utf8');
      const data = JSON.parse(fileContent);
      
      // Restore Maps from arrays
      this.users = new Map(data.users);
      this.profiles = new Map(data.profiles);
      this.socialLinks = new Map(data.socialLinks);
      this.scanLogs = new Map(data.scanLogs);
      
      // Restore IDs
      this.userCurrentId = data.userCurrentId;
      this.profileCurrentId = data.profileCurrentId;
      this.socialLinkCurrentId = data.socialLinkCurrentId;
      this.scanLogCurrentId = data.scanLogCurrentId;
      
      // Convert date strings back to Date objects
      for (const profile of this.profiles.values()) {
        if (profile.createdAt && typeof profile.createdAt === 'string') {
          profile.createdAt = new Date(profile.createdAt);
        }
      }
      
      for (const scanLog of this.scanLogs.values()) {
        if (scanLog.timestamp && typeof scanLog.timestamp === 'string') {
          scanLog.timestamp = new Date(scanLog.timestamp);
        }
      }
      
      console.log("Data loaded from storage");
      console.log(`Users: ${this.users.size}, Profiles: ${this.profiles.size}, SocialLinks: ${this.socialLinks.size}`);
    } catch (error) {
      console.error("Failed to load data from storage:", error);
    }
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
    this.saveToStorage();
    return user;
  }

  async updateUserPremiumStatus(id: number, isPremium: boolean): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = { ...user, isPremium };
    this.users.set(id, updatedUser);
    this.saveToStorage();
    return updatedUser;
  }

  async updateUserStripeCustomerId(id: number, stripeCustomerId: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = { ...user, stripeCustomerId };
    this.users.set(id, updatedUser);
    this.saveToStorage();
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
    this.saveToStorage();
    return newProfile;
  }

  async updateProfile(id: number, profileData: Partial<InsertProfile>): Promise<Profile> {
    const profile = await this.getProfile(id);
    if (!profile) {
      throw new Error(`Profile with id ${id} not found`);
    }

    const updatedProfile: Profile = { ...profile, ...profileData };
    this.profiles.set(id, updatedProfile);
    this.saveToStorage();
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
    const result = this.profiles.delete(id);
    this.saveToStorage();
    return result;
  }

  async incrementScanCount(id: number): Promise<Profile> {
    const profile = await this.getProfile(id);
    if (!profile) {
      throw new Error(`Profile with id ${id} not found`);
    }

    const scanCount = profile.scanCount || 0;
    const updatedProfile = { ...profile, scanCount: scanCount + 1 };
    this.profiles.set(id, updatedProfile);
    this.saveToStorage();
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
    this.saveToStorage();
    return newSocialLink;
  }

  async updateSocialLink(id: number, socialLinkData: Partial<InsertSocialLink>): Promise<SocialLink> {
    const socialLink = this.socialLinks.get(id);
    if (!socialLink) {
      throw new Error(`Social link with id ${id} not found`);
    }

    const updatedSocialLink: SocialLink = { ...socialLink, ...socialLinkData };
    this.socialLinks.set(id, updatedSocialLink);
    this.saveToStorage();
    return updatedSocialLink;
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    const result = this.socialLinks.delete(id);
    this.saveToStorage();
    return result;
  }

  async deleteSocialLinksByProfileId(profileId: number): Promise<boolean> {
    const links = await this.getSocialLinksByProfileId(profileId);
    
    links.forEach((link) => {
      this.socialLinks.delete(link.id);
    });
    
    this.saveToStorage();
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
      location: scanLogData.location || null,
      device: scanLogData.device || null,
      referrer: scanLogData.referrer || null
    };
    
    this.scanLogs.set(id, scanLog);

    // Increment scan count for the profile
    await this.incrementScanCount(scanLogData.profileId);
    
    this.saveToStorage();
    return scanLog;
  }
}

export const storage = new MemStorage();
