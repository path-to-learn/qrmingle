import express from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware";
import { checkIsPremium } from "../lib/premium";

export const aiRouter = express.Router();

const FREE_ASSIST_LIMIT = 2;

const SYSTEM_PROMPTS: Record<string, string> = {
  writer: `You are a professional profile writer for a digital business card app called QrMingle. Given a short description, return ONLY a valid JSON object (no markdown, no explanation) with these fields:
- "name": full name (string)
- "title": job title or role (string, max 60 chars)
- "bio": professional bio (string, max 150 chars, friendly and concise)
- "suggestedLinks": array of {platform, url} for platforms the user explicitly mentions. Platform must be one of: LinkedIn, Facebook, Twitter, Instagram, Email, Phone, Website, GitHub, YouTube, TikTok, WhatsApp, Telegram.
Only include suggestedLinks for platforms the user actually mentions. Return valid JSON only.`,
  tips: `You are a friendly profile coach for a digital business card app. Given a profile's details, return ONLY a valid JSON array of 2-3 short encouraging suggestions (strings) to improve the profile. Be positive and specific, not generic. No markdown, no explanation — just a JSON array of strings.`,
};

aiRouter.post("/card-assist", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPremium = checkIsPremium(user);

    if (!isPremium && (user.aiAssistCount ?? 0) >= FREE_ASSIST_LIMIT) {
      return res.status(403).json({
        message: `You've used your ${FREE_ASSIST_LIMIT} free AI assists. Upgrade to Premium for unlimited.`,
        type: "AI_LIMIT_REACHED",
      });
    }

    const { mode, prompt } = req.body as { mode: "writer" | "tips"; prompt: string };
    if (!mode || !prompt?.trim()) {
      return res.status(400).json({ message: "mode and prompt are required" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ message: "AI service is not configured." });
    }

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPTS[mode],
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      return res.status(500).json({ message: "AI returned an unexpected response. Please try again." });
    }

    await storage.incrementAiAssistCount(userId);
    const assistsUsed = (user.aiAssistCount ?? 0) + 1;

    res.json({ result, assistsUsed, isPremium });
  } catch (error) {
    console.error("AI card assist error:", error);
    res.status(500).json({ message: "AI request failed. Please try again." });
  }
});
