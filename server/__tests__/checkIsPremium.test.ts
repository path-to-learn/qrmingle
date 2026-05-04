import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock storage before importing the module under test
vi.mock("../storage", () => ({
  storage: {
    isUserInActiveTrial: vi.fn(),
  },
}));

import { checkIsPremium, ADMIN_USERNAME } from "../lib/premium";
import { storage } from "../storage";

const mockStorage = storage as { isUserInActiveTrial: ReturnType<typeof vi.fn> };

function makeUser(overrides: Partial<{ isPremium: boolean; isAdmin: boolean; username: string }> = {}) {
  return {
    isPremium: false,
    isAdmin: false,
    username: "user@example.com",
    trialExpiresAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  mockStorage.isUserInActiveTrial.mockReturnValue(false);
});

describe("checkIsPremium", () => {
  it("returns true for a paid premium user", () => {
    expect(checkIsPremium(makeUser({ isPremium: true }))).toBe(true);
  });

  it("returns true for an admin user", () => {
    expect(checkIsPremium(makeUser({ isAdmin: true }))).toBe(true);
  });

  it("returns true for the hardcoded admin username", () => {
    expect(checkIsPremium(makeUser({ username: ADMIN_USERNAME }))).toBe(true);
  });

  it("returns true when user is in an active trial", () => {
    mockStorage.isUserInActiveTrial.mockReturnValue(true);
    expect(checkIsPremium(makeUser())).toBe(true);
  });

  it("returns false for a regular free user", () => {
    expect(checkIsPremium(makeUser())).toBe(false);
  });

  it("returns false when trial is expired", () => {
    mockStorage.isUserInActiveTrial.mockReturnValue(false);
    expect(checkIsPremium(makeUser({ username: "free@example.com" }))).toBe(false);
  });
});
