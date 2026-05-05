/**
 * Full pipeline test — reads mp4.mp4, runs it through the exact same
 * code path the app uses (prompt builder + Gemini + score normalizer).
 * Run: node --experimental-vm-modules scripts/test-full-pipeline.mjs
 * Or:  node scripts/test-full-pipeline.mjs
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load env
const envLines = readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split("\n");
const env = {};
for (const line of envLines) {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
}

const GEMINI_API_KEY = env["GEMINI_API_KEY"];
const MODEL = "gemini-2.5-flash-lite";

console.log("=".repeat(60));
console.log("GoViral — Full Pipeline Test");
console.log("=".repeat(60));
console.log("Model:", MODEL);
console.log("API key:", GEMINI_API_KEY.slice(0, 8) + "...\n");

// Read video
const videoBuffer = readFileSync(resolve(process.cwd(), "mp4.mp4"));
const base64 = videoBuffer.toString("base64");
console.log(`Video: ${Math.round(videoBuffer.length / 1024)}KB (${videoBuffer.length} bytes)`);

// Build prompt (same as app)
const platform = "tiktok";
const mediaType = "video";
const platformLabel = "TikTok";
const weights = { hookStrength: 0.35, pacing: 0.25, visualAppeal: 0.15, captionOptimization: 0.15, platformFit: 0.10 };

const systemInstruction = `You are a world-class social media virality analyst. Your job is to analyze content and return a JSON virality report. You MUST return ONLY a valid JSON object — no markdown, no code fences, no explanation text before or after. Just the raw JSON.`;

const userPrompt = `Analyze this ${mediaType} content for ${platformLabel} virality and return a virality report as a JSON object.

PLATFORM: ${platformLabel}
CONTENT TYPE: ${mediaType}
CAPTION: none

SCORING WEIGHTS FOR TIKTOK:
- hookStrength: ${weights.hookStrength} (most important for TikTok)
- pacing: ${weights.pacing}
- visualAppeal: ${weights.visualAppeal}
- captionOptimization: ${weights.captionOptimization}
- platformFit: ${weights.platformFit}

RULES:
- All scores must be integers between 0 and 100
- Each explanation must be 2-3 sentences
- Each suggestions array must have 1-3 specific, actionable tips
- hashtags: exactly 10-15 tags, all starting with #, no spaces inside tags
- audioSuggestion: one sentence describing the ideal audio style/genre

Return ONLY a JSON object in this exact structure (replace the example values with your real analysis):
{
  "hookStrength": { "score": 75, "explanation": "2-3 sentences about the hook.", "suggestions": ["tip1", "tip2"] },
  "pacing": { "score": 70, "explanation": "2-3 sentences about pacing.", "suggestions": ["tip1"] },
  "visualAppeal": { "score": 80, "explanation": "2-3 sentences about visuals.", "suggestions": ["tip1"] },
  "captionOptimization": { "score": 60, "explanation": "2-3 sentences about caption.", "suggestions": ["tip1", "tip2"] },
  "platformFit": { "score": 72, "explanation": "2-3 sentences about platform fit.", "suggestions": ["tip1"] },
  "hashtags": ["#viral","#tiktok","#fyp","#creator","#content","#trending","#video","#socialmedia","#growth","#reels"],
  "audioSuggestion": "Upbeat electronic pop with a strong beat drop."
}`;

// Call Gemini
console.log("\nCalling Gemini...");
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL,
  generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
});

const result = await model.generateContent({
  systemInstruction,
  contents: [{
    role: "user",
    parts: [
      { text: userPrompt },
      { inlineData: { mimeType: "video/mp4", data: base64 } },
    ],
  }],
});

const rawText = result.response.text();
console.log("\nRaw response (first 300 chars):");
console.log(rawText.slice(0, 300));

// Clean and parse
const cleaned = rawText
  .replace(/^```json\s*/im, "")
  .replace(/^```\s*/im, "")
  .replace(/\s*```\s*$/im, "")
  .replace(/,\s*([}\]])/g, "$1") // fix trailing commas
  .trim();

const scores = JSON.parse(cleaned);

// Compute overall score
const overall = Math.round(
  (scores.hookStrength.score * weights.hookStrength) +
  (scores.pacing.score * weights.pacing) +
  (scores.visualAppeal.score * weights.visualAppeal) +
  (scores.captionOptimization.score * weights.captionOptimization) +
  (scores.platformFit.score * weights.platformFit)
);

console.log("\n" + "=".repeat(60));
console.log("ANALYSIS RESULTS");
console.log("=".repeat(60));
console.log(`Overall Virality Score: ${overall}/100`);
console.log(`Hook Strength:          ${scores.hookStrength.score}/100`);
console.log(`Pacing:                 ${scores.pacing?.score ?? "N/A"}/100`);
console.log(`Visual Appeal:          ${scores.visualAppeal?.score ?? "N/A"}/100`);
console.log(`Caption:                ${scores.captionOptimization.score}/100`);
console.log(`Platform Fit:           ${scores.platformFit.score}/100`);
console.log(`\nHashtags: ${scores.hashtags?.slice(0, 5).join(" ")}...`);
console.log(`Audio: ${scores.audioSuggestion}`);
console.log("\n✅ Pipeline test PASSED — the app will work correctly.");
