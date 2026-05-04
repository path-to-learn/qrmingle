import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// All vi.mock calls must be at top level (they get hoisted)
vi.mock("../storage", () => ({
  storage: {
    getProfilesByUserId: vi.fn(),
    getUser: vi.fn(),
    createProfile: vi.fn(),
    getSocialLinksByProfileId: vi.fn(),
    createSocialLink: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    deleteSocialLinksByProfileId: vi.fn(),
    deleteProfile: vi.fn(),
    getProfileBySlug: vi.fn(),
    createScanLog: vi.fn(),
    isUserInActiveTrial: vi.fn().mockReturnValue(false),
  },
}));

vi.mock("geoip-lite", () => ({ default: { lookup: vi.fn().mockReturnValue(null) } }));

import { storage } from "../storage";
import { profilesRouter } from "../routes/profiles";

const mockStorage = storage as Record<string, ReturnType<typeof vi.fn>>;

function buildApp(userId: number) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.user = { id: userId };
    req.isAuthenticated = () => true;
    next();
  });
  app.use("/profiles", profilesRouter);
  return app;
}

const freeUser = { id: 1, isPremium: false, isAdmin: false, username: "free@test.com", trialExpiresAt: null };
const premiumUser = { id: 2, isPremium: true, isAdmin: false, username: "paid@test.com", trialExpiresAt: null };

const validProfileBody = {
  displayName: "Test User",
  name: "Test User",
  title: "Engineer",
  bio: "",
  socialLinks: [{ platform: "LinkedIn", url: "https://linkedin.com/in/test" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockStorage.isUserInActiveTrial.mockReturnValue(false);
  mockStorage.getSocialLinksByProfileId.mockResolvedValue([]);
  mockStorage.createSocialLink.mockImplementation(async (link: any) => link);
});

describe("GET /profiles — lists user profiles", () => {
  it("returns profiles for the authenticated user", async () => {
    mockStorage.getProfilesByUserId.mockResolvedValue([{ id: 1, userId: 1 }]);

    const res = await request(buildApp(1)).get("/profiles");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockStorage.getProfilesByUserId).toHaveBeenCalledWith(1);
  });
});

describe("POST /profiles — profile creation limit", () => {
  it("allows a free user to create their 1st profile", async () => {
    mockStorage.getUser.mockResolvedValue(freeUser);
    mockStorage.getProfilesByUserId.mockResolvedValue([]);
    mockStorage.createProfile.mockResolvedValue({ id: 10, ...validProfileBody, userId: 1, slug: "test-abc" });

    const res = await request(buildApp(1)).post("/profiles").send(validProfileBody);
    expect(res.status).toBe(201);
  });

  it("blocks a free user from creating a 3rd profile", async () => {
    mockStorage.getUser.mockResolvedValue(freeUser);
    mockStorage.getProfilesByUserId.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const res = await request(buildApp(1)).post("/profiles").send(validProfileBody);
    expect(res.status).toBe(403);
    expect(res.body.type).toBe("PROFILE_LIMIT_REACHED");
    expect(res.body.message).toMatch(/2 profiles/);
  });

  it("allows a premium user to create a 3rd profile", async () => {
    mockStorage.getUser.mockResolvedValue(premiumUser);
    mockStorage.getProfilesByUserId.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockStorage.createProfile.mockResolvedValue({ id: 11, ...validProfileBody, userId: 2, slug: "test-xyz" });

    const res = await request(buildApp(2)).post("/profiles").send(validProfileBody);
    expect(res.status).toBe(201);
  });

  it("blocks a premium user from creating a 6th profile", async () => {
    mockStorage.getUser.mockResolvedValue(premiumUser);
    mockStorage.getProfilesByUserId.mockResolvedValue([{}, {}, {}, {}, {}]);

    const res = await request(buildApp(2)).post("/profiles").send(validProfileBody);
    expect(res.status).toBe(403);
    expect(res.body.type).toBe("PROFILE_LIMIT_REACHED");
    expect(res.body.message).toMatch(/5 profiles/);
  });

  it("returns 401 when not authenticated", async () => {
    const app = express();
    app.use(express.json());
    app.use((req: any, _res, next) => {
      req.isAuthenticated = () => false;
      next();
    });
    app.use("/profiles", profilesRouter);

    const res = await request(app).post("/profiles").send(validProfileBody);
    expect(res.status).toBe(401);
  });
});

describe("DELETE /profiles/:id — ownership check", () => {
  it("returns 403 when deleting another user's profile", async () => {
    mockStorage.getProfile.mockResolvedValue({ id: 5, userId: 99 }); // owned by user 99

    const res = await request(buildApp(1)).delete("/profiles/5");
    expect(res.status).toBe(403);
  });

  it("deletes profile when owner matches", async () => {
    mockStorage.getProfile.mockResolvedValue({ id: 5, userId: 1 });
    mockStorage.deleteProfile.mockResolvedValue(true);

    const res = await request(buildApp(1)).delete("/profiles/5");
    expect(res.status).toBe(204);
  });
});
