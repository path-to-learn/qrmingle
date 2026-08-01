import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    getUserByAppleOriginalTransactionId: vi.fn(),
    updateUserPremiumStatus: vi.fn(),
    linkAppleOriginalTransactionId: vi.fn(),
    updateAppleLastNotificationSignedDate: vi.fn(),
  },
}));

vi.mock("../lib/apple-iap", () => ({
  verifyStoreKitNotification: vi.fn(),
  verifyStoreKitTransaction: vi.fn(),
}));

import { storage } from "../storage";
import { verifyStoreKitNotification, verifyStoreKitTransaction } from "../lib/apple-iap";
import { miscRouter } from "../routes/misc";

const mockStorage = storage as Record<string, ReturnType<typeof vi.fn>>;
const mockVerifyNotification = verifyStoreKitNotification as ReturnType<typeof vi.fn>;
const mockVerifyTransaction = verifyStoreKitTransaction as ReturnType<typeof vi.fn>;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/", miscRouter);
  return app;
}

const linkedUser = { id: 1, isPremium: true, appleOriginalTransactionId: "orig-tx-1", appleLastNotificationSignedDate: null };
const lapsedUser = { id: 2, isPremium: false, appleOriginalTransactionId: "orig-tx-2", appleLastNotificationSignedDate: null };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /iap/notifications", () => {
  it("downgrades a user when their subscription expires", async () => {
    mockVerifyNotification.mockResolvedValue({
      notificationType: "EXPIRED",
      data: { signedTransactionInfo: "signed-tx" },
    });
    mockVerifyTransaction.mockResolvedValue({ originalTransactionId: "orig-tx-1" });
    mockStorage.getUserByAppleOriginalTransactionId.mockResolvedValue(linkedUser);

    const res = await request(buildApp())
      .post("/iap/notifications")
      .send({ signedPayload: "signed-payload" });

    expect(res.status).toBe(200);
    expect(mockStorage.updateUserPremiumStatus).toHaveBeenCalledWith(1, false);
  });

  it("re-grants premium on a successful renewal", async () => {
    mockVerifyNotification.mockResolvedValue({
      notificationType: "DID_RENEW",
      data: { signedTransactionInfo: "signed-tx" },
    });
    mockVerifyTransaction.mockResolvedValue({ originalTransactionId: "orig-tx-2" });
    mockStorage.getUserByAppleOriginalTransactionId.mockResolvedValue(lapsedUser);

    const res = await request(buildApp())
      .post("/iap/notifications")
      .send({ signedPayload: "signed-payload" });

    expect(res.status).toBe(200);
    expect(mockStorage.updateUserPremiumStatus).toHaveBeenCalledWith(2, true);
  });

  it("does not touch premium status for an unhandled notification type", async () => {
    mockVerifyNotification.mockResolvedValue({
      notificationType: "PRICE_INCREASE",
      data: { signedTransactionInfo: "signed-tx" },
    });
    mockVerifyTransaction.mockResolvedValue({ originalTransactionId: "orig-tx-1" });
    mockStorage.getUserByAppleOriginalTransactionId.mockResolvedValue(linkedUser);

    const res = await request(buildApp())
      .post("/iap/notifications")
      .send({ signedPayload: "signed-payload" });

    expect(res.status).toBe(200);
    expect(mockStorage.updateUserPremiumStatus).not.toHaveBeenCalled();
  });

  it("ignores a notification for an unknown transaction", async () => {
    mockVerifyNotification.mockResolvedValue({
      notificationType: "EXPIRED",
      data: { signedTransactionInfo: "signed-tx" },
    });
    mockVerifyTransaction.mockResolvedValue({ originalTransactionId: "unknown-tx" });
    mockStorage.getUserByAppleOriginalTransactionId.mockResolvedValue(undefined);

    const res = await request(buildApp())
      .post("/iap/notifications")
      .send({ signedPayload: "signed-payload" });

    expect(res.status).toBe(200);
    expect(mockStorage.updateUserPremiumStatus).not.toHaveBeenCalled();
  });

  it("does not grant premium on DID_CHANGE_RENEWAL_PREF (plan change ≠ entitlement change)", async () => {
    mockVerifyNotification.mockResolvedValue({
      notificationType: "DID_CHANGE_RENEWAL_PREF",
      data: { signedTransactionInfo: "signed-tx" },
    });
    mockVerifyTransaction.mockResolvedValue({ originalTransactionId: "orig-tx-2" });
    mockStorage.getUserByAppleOriginalTransactionId.mockResolvedValue(lapsedUser);

    const res = await request(buildApp())
      .post("/iap/notifications")
      .send({ signedPayload: "signed-payload" });

    expect(res.status).toBe(200);
    expect(mockStorage.updateUserPremiumStatus).not.toHaveBeenCalled();
  });

  it("ignores a stale notification that is older than the last one already processed", async () => {
    mockVerifyNotification.mockResolvedValue({
      notificationType: "EXPIRED",
      signedDate: new Date("2026-01-01T00:00:00Z").getTime(),
      data: { signedTransactionInfo: "signed-tx" },
    });
    mockVerifyTransaction.mockResolvedValue({ originalTransactionId: "orig-tx-1" });
    mockStorage.getUserByAppleOriginalTransactionId.mockResolvedValue({
      ...linkedUser,
      appleLastNotificationSignedDate: new Date("2026-02-01T00:00:00Z"),
    });

    const res = await request(buildApp())
      .post("/iap/notifications")
      .send({ signedPayload: "signed-payload" });

    expect(res.status).toBe(200);
    expect(res.body.stale).toBe(true);
    expect(mockStorage.updateUserPremiumStatus).not.toHaveBeenCalled();
  });

  it("processes and records a notification newer than the last one seen", async () => {
    const signedDate = new Date("2026-03-01T00:00:00Z").getTime();
    mockVerifyNotification.mockResolvedValue({
      notificationType: "EXPIRED",
      signedDate,
      data: { signedTransactionInfo: "signed-tx" },
    });
    mockVerifyTransaction.mockResolvedValue({ originalTransactionId: "orig-tx-1" });
    mockStorage.getUserByAppleOriginalTransactionId.mockResolvedValue({
      ...linkedUser,
      appleLastNotificationSignedDate: new Date("2026-02-01T00:00:00Z"),
    });

    const res = await request(buildApp())
      .post("/iap/notifications")
      .send({ signedPayload: "signed-payload" });

    expect(res.status).toBe(200);
    expect(mockStorage.updateUserPremiumStatus).toHaveBeenCalledWith(1, false);
    expect(mockStorage.updateAppleLastNotificationSignedDate).toHaveBeenCalledWith(1, new Date(signedDate));
  });

  it("returns 400 when signedPayload is missing", async () => {
    const res = await request(buildApp()).post("/iap/notifications").send({});
    expect(res.status).toBe(400);
  });

  it("returns 500 (so Apple retries) when verification throws", async () => {
    mockVerifyNotification.mockRejectedValue(new Error("bad signature"));

    const res = await request(buildApp())
      .post("/iap/notifications")
      .send({ signedPayload: "garbage" });

    expect(res.status).toBe(500);
  });
});
