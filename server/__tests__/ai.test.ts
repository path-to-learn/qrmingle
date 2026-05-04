import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    getUser: vi.fn(),
    incrementAiAssistCount: vi.fn(),
    isUserInActiveTrial: vi.fn().mockReturnValue(false),
  },
}));

// Mock the Anthropic SDK so tests don't make real API calls.
// Must be a class (used with `new`) — arrow functions can't be constructors.
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: '{"name":"Test","title":"Dev","bio":"Hello","suggestedLinks":[]}' }],
      }),
    };
  },
}));

import { storage } from "../storage";
import { aiRouter } from "../routes/ai";

const mockStorage = storage as Record<string, ReturnType<typeof vi.fn>>;

function buildApp(userId: number) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.user = { id: userId };
    req.isAuthenticated = () => true;
    next();
  });
  app.use("/ai", aiRouter);
  return app;
}

const freeUserAt0 = { id: 1, isPremium: false, isAdmin: false, username: "free@test.com", aiAssistCount: 0 };
const freeUserAt2 = { id: 1, isPremium: false, isAdmin: false, username: "free@test.com", aiAssistCount: 2 };
const premiumUser = { id: 2, isPremium: true, isAdmin: false, username: "paid@test.com", aiAssistCount: 99 };

beforeEach(() => {
  vi.clearAllMocks();
  mockStorage.isUserInActiveTrial.mockReturnValue(false);
  mockStorage.incrementAiAssistCount.mockResolvedValue(undefined);
  // Set a dummy API key so the "not configured" check passes
  process.env.ANTHROPIC_API_KEY = "test-key";
});

describe("POST /ai/card-assist — assist limit", () => {
  it("allows a free user on their 1st use", async () => {
    mockStorage.getUser.mockResolvedValue(freeUserAt0);

    const res = await request(buildApp(1))
      .post("/ai/card-assist")
      .send({ mode: "writer", prompt: "I am a software engineer" });

    expect(res.status).toBe(200);
    expect(res.body.assistsUsed).toBe(1);
    expect(res.body.isPremium).toBe(false);
    expect(mockStorage.incrementAiAssistCount).toHaveBeenCalledWith(1);
  });

  it("blocks a free user who has used all 2 free assists", async () => {
    mockStorage.getUser.mockResolvedValue(freeUserAt2);

    const res = await request(buildApp(1))
      .post("/ai/card-assist")
      .send({ mode: "writer", prompt: "I am a software engineer" });

    expect(res.status).toBe(403);
    expect(res.body.type).toBe("AI_LIMIT_REACHED");
    expect(mockStorage.incrementAiAssistCount).not.toHaveBeenCalled();
  });

  it("allows a premium user regardless of assist count", async () => {
    mockStorage.getUser.mockResolvedValue(premiumUser);

    const res = await request(buildApp(2))
      .post("/ai/card-assist")
      .send({ mode: "writer", prompt: "I am a software engineer" });

    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(true);
  });

  it("returns 400 when mode or prompt is missing", async () => {
    mockStorage.getUser.mockResolvedValue(freeUserAt0);

    const res = await request(buildApp(1)).post("/ai/card-assist").send({ mode: "writer" });
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const app = express();
    app.use(express.json());
    app.use((req: any, _res, next) => {
      req.isAuthenticated = () => false;
      next();
    });
    app.use("/ai", aiRouter);

    const res = await request(app).post("/ai/card-assist").send({ mode: "writer", prompt: "test" });
    expect(res.status).toBe(401);
  });
});
