import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { sessions } from "@shared/schema";
import { and, eq, gt } from "drizzle-orm";
import { storage } from "./storage";

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 1 week — keep in sync with server/auth.ts cookie.maxAge

// Resolves auth for Capacitor iOS standalone builds where WKWebView ITP blocks
// cross-origin cookies on POST requests. After login the client stores the session ID
// and sends it here as a header so we can look it up in the session store directly.
export async function capacitorAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.headers["x-session-id"] as string | undefined;
  if (sessionId) {
    try {
      const rows = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.sid, sessionId), gt(sessions.expire, new Date())));
      if (rows.length > 0) {
        const sess = rows[0].sess as any;
        const userId = sess?.passport?.user;
        if (userId) {
          const user = await storage.getUser(userId);
          if (user) {
            req.user = user as any;
            // Rolling expiry: this header-based path bypasses express-session's own
            // rolling logic entirely, so without this the app silently logs users out
            // 7 days after their last login even with daily use.
            db.update(sessions)
              .set({ expire: new Date(Date.now() + SESSION_MAX_AGE_MS) })
              .where(eq(sessions.sid, sessionId))
              .catch(() => {});
          }
        }
      }
    } catch {
      // ignore — request proceeds unauthenticated
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user && !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user && !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Not authorized - Admin access required" });
  }
  next();
}
