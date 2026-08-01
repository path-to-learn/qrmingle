import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    updateUserPremiumStatus: vi.fn(),
    linkAppleOriginalTransactionId: vi.fn(),
  },
}));

vi.mock("../lib/apple-iap", () => ({
  verifyStoreKitTransaction: vi.fn(),
  verifyStoreKitNotification: vi.fn(),
}));

import { storage } from "../storage";
import { verifyStoreKitTransaction } from "../lib/apple-iap";
import { miscRouter } from "../routes/misc";

const mockStorage = storage as Record<string, ReturnType<typeof vi.fn>>;
const mockVerifyTransaction = verifyStoreKitTransaction as ReturnType<typeof vi.fn>;

function buildApp(userId: number) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.user = { id: userId };
    req.isAuthenticated = () => true;
    next();
  });
  app.use("/", miscRouter);
  return app;
}

const activeEntitlement = {
  productId: "com.qrmingle.app.sub.monthly",
  originalTransactionId: "orig-tx-1",
  revocationDate: undefined,
  expiresDate: Date.now() + 1000 * 60 * 60 * 24 * 30,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /iap/verify — transaction ownership", () => {
  it("grants premium and links the transaction on a fresh purchase", async () => {
    mockVerifyTransaction.mockResolvedValue(activeEntitlement);
    mockStorage.linkAppleOriginalTransactionId.mockResolvedValue(undefined);

    const res = await request(buildApp(1))
      .post("/iap/verify")
      .send({ jwsRepresentation: "signed-tx" });

    expect(res.status).toBe(200);
    expect(mockStorage.linkAppleOriginalTransactionId).toHaveBeenCalledWith(1, "orig-tx-1");
    expect(mockStorage.updateUserPremiumStatus).toHaveBeenCalledWith(1, true);
  });

  it("rejects with 409 and does not grant premium when the transaction is already linked to another account", async () => {
    mockVerifyTransaction.mockResolvedValue(activeEntitlement);
    mockStorage.linkAppleOriginalTransactionId.mockRejectedValue(
      new Error("Apple transaction orig-tx-1 is already linked to a different account")
    );

    const res = await request(buildApp(2))
      .post("/iap/verify")
      .send({ jwsRepresentation: "signed-tx" });

    expect(res.status).toBe(409);
    expect(mockStorage.updateUserPremiumStatus).not.toHaveBeenCalled();
  });
});

describe("POST /iap/restore — transaction ownership", () => {
  it("skips a transaction already owned by a different account and keeps checking others", async () => {
    const otherEntitlement = { ...activeEntitlement, originalTransactionId: "orig-tx-2" };
    mockVerifyTransaction
      .mockResolvedValueOnce(activeEntitlement)
      .mockResolvedValueOnce(otherEntitlement);
    mockStorage.linkAppleOriginalTransactionId
      .mockRejectedValueOnce(new Error("already linked to a different account"))
      .mockResolvedValueOnce(undefined);

    const res = await request(buildApp(3))
      .post("/iap/restore")
      .send({
        transactions: [
          { jwsRepresentation: "signed-tx-1" },
          { jwsRepresentation: "signed-tx-2" },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.restored).toBe(true);
    expect(mockStorage.updateUserPremiumStatus).toHaveBeenCalledWith(3, true);
  });
});
