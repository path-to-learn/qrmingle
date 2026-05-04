import express from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import { requireAuth } from "../middleware";

export const paymentsRouter = express.Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" as any })
  : null;

paymentsRouter.post("/start-premium-trial", requireAuth, async (req, res) => {
  try {
    const { durationDays = 7 } = req.body;
    const userId = req.user!.id;
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isPremium) {
      return res.status(400).json({ message: "User is already a premium user and doesn't need a trial" });
    }

    if (storage.isUserInActiveTrial(user)) {
      const expiry = user.trialExpiresAt
        ? (user.trialExpiresAt instanceof Date ? user.trialExpiresAt : new Date(user.trialExpiresAt))
            .toISOString()
            .split("T")[0]
        : "unknown date";
      return res.status(400).json({ message: `User already has an active trial expiring on ${expiry}` });
    }

    const updatedUser = await storage.startPremiumTrial(userId, durationDays);
    const trialExpiresAt = updatedUser.trialExpiresAt
      ? (updatedUser.trialExpiresAt instanceof Date ? updatedUser.trialExpiresAt : new Date(updatedUser.trialExpiresAt))
          .toISOString()
          .split("T")[0]
      : "unknown date";

    res.json({
      message: `Premium trial activated. Expires on ${trialExpiresAt}`,
      user: {
        ...updatedUser,
        trialExpiresAt: updatedUser.trialExpiresAt
          ? updatedUser.trialExpiresAt instanceof Date
            ? updatedUser.trialExpiresAt.toISOString()
            : updatedUser.trialExpiresAt
          : null,
      },
    });
  } catch (error) {
    console.error("Failed to start premium trial:", error);
    res.status(500).json({ message: "Failed to start premium trial" });
  }
});

if (stripe) {
  paymentsRouter.post("/stripe-webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not set — rejecting webhook");
      return res.status(400).json({ message: "Webhook not configured" });
    }

    let event: any;
    try {
      event = stripe.webhooks.constructEvent((req as any).rawBody, sig, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      return res.status(400).json({ message: "Webhook signature verification failed" });
    }

    try {
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata?.userId;
        if (userId) {
          const user = await storage.getUser(parseInt(userId));
          if (user) await storage.updateUserPremiumStatus(parseInt(userId), true);
        }
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      res.status(500).json({ message: "Webhook error" });
    }
  });

  paymentsRouter.post("/create-payment-intent", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: 499,
        currency: "usd",
        metadata: { userId: userId.toString() },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  paymentsRouter.post("/confirm-premium", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) return res.status(400).json({ message: "Payment intent ID is required" });

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== "succeeded") return res.status(400).json({ message: "Payment not successful" });
      if (paymentIntent.metadata?.userId !== String(userId))
        return res.status(403).json({ message: "Payment intent does not belong to this user" });

      const updatedUser = await storage.updateUserPremiumStatus(userId, true);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to confirm premium upgrade" });
    }
  });
}
