import express from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware";

export const reviewsRouter = express.Router();

reviewsRouter.get("/", async (req, res) => {
  try {
    const reviews = await storage.getReviews(true);
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

reviewsRouter.post("/", async (req, res) => {
  try {
    const { name, title, content, rating } = req.body;
    if (!name || !content || !rating) {
      return res.status(400).json({ message: "Name, content, and rating are required" });
    }
    const review = await storage.createReview({ name, title: title || null, content, rating, avatarUrl: null });
    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted and will be visible after approval.",
      review,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// Admin review management
reviewsRouter.get("/admin", requireAuth, async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Unauthorized" });
    const reviews = await storage.getReviews(false);
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

reviewsRouter.patch("/admin/:id", requireAuth, async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Unauthorized" });
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid review ID" });
    const { isVisible } = req.body;
    if (typeof isVisible !== "boolean") return res.status(400).json({ message: "isVisible must be a boolean" });
    const review = await storage.updateReviewVisibility(id, isVisible);
    res.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

reviewsRouter.delete("/admin/:id", requireAuth, async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Unauthorized" });
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid review ID" });
    const deleted = await storage.deleteReview(id);
    if (!deleted) return res.status(404).json({ message: "Review not found" });
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});
