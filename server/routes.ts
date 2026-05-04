import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { setupAuth } from "./auth";
import { profilesRouter } from "./routes/profiles";
import { analyticsRouter } from "./routes/analytics";
import { aiRouter } from "./routes/ai";
import { reviewsRouter } from "./routes/reviews";
import { adminRouter } from "./routes/admin";
import { paymentsRouter } from "./routes/payments";
import { miscRouter } from "./routes/misc";

const ALLOWED_ORIGINS = new Set([
  "https://qrmingle.com",
  "http://localhost:5000",
  "capacitor://localhost",
]);

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  if (app.get("env") === "production") {
    app.use((req, res, next) => {
      if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
        const origin = req.headers.origin;
        if (origin && !ALLOWED_ORIGINS.has(origin)) {
          return res.status(403).json({ message: "Forbidden: invalid origin" });
        }
      }
      next();
    });
  }

  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  // Public QR landing page — handled by the frontend router
  app.get("/p/:slug", (_req, res) => {
    res.sendFile("index.html", { root: "./dist/public" });
  });

  const api = express.Router();
  app.use("/api", api);

  api.use("/profiles", profilesRouter);
  api.use("/analytics", analyticsRouter);
  api.use("/ai", aiRouter);
  api.use("/reviews", reviewsRouter);
  api.use("/admin", adminRouter);
  api.use("/", paymentsRouter);
  api.use("/", miscRouter);

  return createServer(app);
}
