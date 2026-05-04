import type { Request } from "express";
import { storage } from "../storage";

export const ADMIN_USERNAME = "dathwal@qrmingle#2025";

export function checkIsPremium(user: {
  isPremium: boolean;
  isAdmin: boolean;
  username: string;
  trialExpiresAt?: Date | null;
  [key: string]: any;
}): boolean {
  return (
    user.isPremium ||
    user.isAdmin ||
    user.username === ADMIN_USERNAME ||
    storage.isUserInActiveTrial(user as any)
  );
}

export function getVisitorIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return first.trim();
  }
  return req.ip || "Unknown";
}
