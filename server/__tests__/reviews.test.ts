import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    getReviews: vi.fn(),
    createReview: vi.fn(),
    updateReviewVisibility: vi.fn(),
    deleteReview: vi.fn(),
  },
}));

import { storage } from "../storage";
import { reviewsRouter } from "../routes/reviews";

const mockStorage = storage as Record<string, ReturnType<typeof vi.fn>>;

function buildApp(opts: { authenticated?: boolean; isAdmin?: boolean } = {}) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.isAuthenticated = () => opts.authenticated ?? true;
    if (opts.authenticated !== false) {
      req.user = { id: 1, isAdmin: opts.isAdmin ?? false };
    }
    next();
  });
  app.use("/reviews", reviewsRouter);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /reviews — public", () => {
  it("returns only visible reviews", async () => {
    mockStorage.getReviews.mockResolvedValue([{ id: 1, content: "Great!", isVisible: true }]);

    const res = await request(buildApp()).get("/reviews");
    expect(res.status).toBe(200);
    expect(mockStorage.getReviews).toHaveBeenCalledWith(true);
  });
});

describe("POST /reviews — public submission", () => {
  it("creates a review and returns 201", async () => {
    mockStorage.createReview.mockResolvedValue({ id: 5, name: "Alice", rating: 5, isVisible: false });

    const res = await request(buildApp()).post("/reviews").send({ name: "Alice", content: "Loved it!", rating: 5 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(buildApp()).post("/reviews").send({ name: "Alice" });
    expect(res.status).toBe(400);
  });
});

describe("GET /reviews/admin — admin only", () => {
  it("returns all reviews including hidden ones for admin", async () => {
    mockStorage.getReviews.mockResolvedValue([{ id: 1, isVisible: false }]);

    const res = await request(buildApp({ isAdmin: true })).get("/reviews/admin");
    expect(res.status).toBe(200);
    expect(mockStorage.getReviews).toHaveBeenCalledWith(false);
  });

  it("returns 403 for non-admin authenticated users", async () => {
    const res = await request(buildApp({ isAdmin: false })).get("/reviews/admin");
    expect(res.status).toBe(403);
  });

  it("returns 401 for unauthenticated requests", async () => {
    const res = await request(buildApp({ authenticated: false })).get("/reviews/admin");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /reviews/admin/:id — approve/hide", () => {
  it("updates visibility for admin", async () => {
    mockStorage.updateReviewVisibility.mockResolvedValue({ id: 1, isVisible: true });

    const res = await request(buildApp({ isAdmin: true })).patch("/reviews/admin/1").send({ isVisible: true });
    expect(res.status).toBe(200);
    expect(mockStorage.updateReviewVisibility).toHaveBeenCalledWith(1, true);
  });

  it("returns 400 when isVisible is not a boolean", async () => {
    const res = await request(buildApp({ isAdmin: true })).patch("/reviews/admin/1").send({ isVisible: "yes" });
    expect(res.status).toBe(400);
  });

  it("returns 403 for non-admin", async () => {
    const res = await request(buildApp({ isAdmin: false })).patch("/reviews/admin/1").send({ isVisible: true });
    expect(res.status).toBe(403);
  });
});

describe("DELETE /reviews/admin/:id", () => {
  it("deletes a review for admin", async () => {
    mockStorage.deleteReview.mockResolvedValue(true);

    const res = await request(buildApp({ isAdmin: true })).delete("/reviews/admin/1");
    expect(res.status).toBe(204);
  });

  it("returns 404 when review not found", async () => {
    mockStorage.deleteReview.mockResolvedValue(false);

    const res = await request(buildApp({ isAdmin: true })).delete("/reviews/admin/99");
    expect(res.status).toBe(404);
  });

  it("returns 403 for non-admin", async () => {
    const res = await request(buildApp({ isAdmin: false })).delete("/reviews/admin/1");
    expect(res.status).toBe(403);
  });
});
