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

function parseAiJson(raw: string) {
  const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(text);
}

function normalizeBusinessCardResult(result: any) {
  const name = String(result?.name || "").trim();
  const title = String(result?.title || "").trim().slice(0, 60);
  const company = String(result?.company || "").trim();
  const bio = String(result?.bio || "").trim().slice(0, 150);
  const socialLinks = Array.isArray(result?.suggestedLinks)
    ? result.suggestedLinks
        .map((link: any) => ({
          platform: String(link?.platform || "").trim(),
          url: String(link?.url || "").trim(),
        }))
        .filter((link: any) => link.platform && link.url)
        .slice(0, 6)
    : [];

  return {
    name,
    title: title || company || "New Contact",
    company,
    bio,
    suggestedLinks: socialLinks,
  };
}

function parseImageDataUrl(imageDataUrl?: string): {
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  imageBase64: string;
  imageBytes: number;
} | null {
  if (!imageDataUrl) return null;

  const commaIndex = imageDataUrl.indexOf(",");
  if (commaIndex === -1) return null;

  const header = imageDataUrl.slice(0, commaIndex).trim().toLowerCase();
  const headerMatch = /^data:([^;,]+)(?:;charset=[^;,]+)?;base64$/.exec(header);
  if (!headerMatch) return null;

  let mediaType = headerMatch[1];
  if (mediaType === "image/jpg") mediaType = "image/jpeg";
  if (!["image/jpeg", "image/png", "image/webp"].includes(mediaType)) return null;

  const imageBase64 = imageDataUrl
    .slice(commaIndex + 1)
    .replace(/[\r\n\s]/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64)) return null;

  const imageBuffer = Buffer.from(imageBase64, "base64");
  if (imageBuffer.length === 0) return null;

  return {
    mediaType: mediaType as "image/jpeg" | "image/png" | "image/webp",
    imageBase64: imageBuffer.toString("base64"),
    imageBytes: imageBuffer.length,
  };
}

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

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
    let result: any;
    try {
      result = parseAiJson(raw);
    } catch {
      console.error("AI JSON parse failed. Raw response:", raw);
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

aiRouter.post("/business-card-ocr", requireAuth, async (req, res) => {
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

    const { imageDataUrl } = req.body as { imageDataUrl?: string };
    const parsedImage = parseImageDataUrl(imageDataUrl);
    if (!parsedImage) {
      return res.status(400).json({ message: "A JPEG, PNG, or WebP business card image is required." });
    }

    const { mediaType, imageBase64, imageBytes } = parsedImage;
    if (imageBytes > 5 * 1024 * 1024) {
      return res.status(413).json({ message: "Image is too large. Please retake the photo closer to the card." });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ message: "AI service is not configured." });
    }

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      system: `You extract contact details from business card photos for QrMingle. Return ONLY valid JSON with:
- "name": person's full name, or empty string if unclear
- "title": role/job title, max 60 chars
- "company": company name, or empty string
- "bio": short professional line, max 150 chars
- "suggestedLinks": array of { "platform": one of Email, Phone, Website, LinkedIn, Twitter, Instagram, Facebook, GitHub, YouTube, TikTok, WhatsApp, Telegram, "url": value }
Use only information visible on the card. Do not invent missing links.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Extract the contact details from this business card image.",
            },
          ] as any,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
    let result: any;
    try {
      result = normalizeBusinessCardResult(parseAiJson(raw));
    } catch {
      console.error("Business card OCR JSON parse failed. Raw response:", raw);
      return res.status(500).json({ message: "AI could not read that card clearly. Please retake the photo." });
    }

    if (!result.name && result.suggestedLinks.length === 0) {
      return res.status(422).json({ message: "No contact details were found. Please retake the photo in better light." });
    }

    await storage.incrementAiAssistCount(userId);
    const assistsUsed = (user.aiAssistCount ?? 0) + 1;

    res.json({ result, assistsUsed, isPremium });
  } catch (error) {
    console.error("Business card OCR error:", error);
    const message = error instanceof Error && error.message.includes("expected pattern")
      ? "The image could not be processed. Please crop the card again or choose a clear PNG/JPEG from Photos."
      : "Failed to scan business card. Please try again.";
    res.status(500).json({ message });
  }
});
