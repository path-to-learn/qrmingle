import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    getProfile: vi.fn(),
    getUser: vi.fn(),
    getScanLogsByProfileId: vi.fn(),
    isUserInActiveTrial: vi.fn().mockReturnValue(false),
  },
}));

import { storage } from "../storage";
import { analyticsRouter } from "../routes/analytics";

const mockStorage = storage as Record<string, ReturnType<typeof vi.fn>>;

function buildApp(userId: number) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.user = { id: userId };
    req.isAuthenticated = () => true;
    next();
  });
  app.use("/analytics", analyticsRouter);
  return app;
}

const freeUser = { id: 1, isPremium: false, isAdmin: false, username: "free@test.com", trialExpiresAt: null };
const premiumUser = { id: 2, isPremium: true, isAdmin: false, username: "paid@test.com", trialExpiresAt: null };

beforeEach(() => {
  vi.clearAllMocks();
  mockStorage.isUserInActiveTrial.mockReturnValue(false);
});

describe("GET /analytics/profile/:id — premium gating", () => {
  it("returns limited data for a free user", async () => {
    mockStorage.getProfile.mockResolvedValue({ id: 10, userId: 1, scanCount: 42 });
    mockStorage.getUser.mockResolvedValue(freeUser);

    const res = await request(buildApp(1)).get("/analytics/profile/10");
    expect(res.status).toBe(200);
    expect(res.body.isLimited).toBe(true);
    expect(res.body.totalScans).toBe(42);
    expect(res.body.scansByDate).toEqual({});
    expect(res.body.deviceDistribution).toEqual({});
    // Full chart data must NOT be in the response for free users
    expect(mockStorage.getScanLogsByProfileId).not.toHaveBeenCalled();
  });

  it("returns full chart data for a premium user", async () => {
    mockStorage.getProfile.mockResolvedValue({ id: 11, userId: 2, scanCount: 100 });
    mockStorage.getUser.mockResolvedValue(premiumUser);
    mockStorage.getScanLogsByProfileId.mockResolvedValue([
      { timestamp: new Date("2025-01-10"), device: "iPhone", country: "US", countryCode: "US", location: "New York" },
      { timestamp: new Date("2025-01-11"), device: "Android", country: "IN", countryCode: "IN", location: "Mumbai" },
    ]);

    const res = await request(buildApp(2)).get("/analytics/profile/11");
    expect(res.status).toBe(200);
    expect(res.body.isLimited).toBe(false);
    expect(res.body.scansByDate).toBeDefined();
    expect(Object.keys(res.body.scansByDate).length).toBeGreaterThan(0);
    expect(mockStorage.getScanLogsByProfileId).toHaveBeenCalledWith(11);
  });

  it("returns 403 when accessing another user's analytics", async () => {
    mockStorage.getProfile.mockResolvedValue({ id: 10, userId: 99 }); // owned by user 99

    const res = await request(buildApp(1)).get("/analytics/profile/10");
    expect(res.status).toBe(403);
  });

  it("returns 401 when not authenticated", async () => {
    const app = express();
    app.use(express.json());
    app.use((req: any, _res, next) => {
      req.isAuthenticated = () => false;
      next();
    });
    app.use("/analytics", analyticsRouter);

    const res = await request(app).get("/analytics/profile/10");
    expect(res.status).toBe(401);
  });
});
