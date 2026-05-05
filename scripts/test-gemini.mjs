/**
 * Direct Gemini test — tries multiple models to find one that works on free tier.
 * Run: node scripts/test-gemini.mjs
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const envLines = readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split("\n");
const env = {};
for (const line of envLines) {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
}

const GEMINI_API_KEY = env["GEMINI_API_KEY"];
console.log("✅ API key:", GEMINI_API_KEY.slice(0, 8) + "...");

const videoBuffer = readFileSync(resolve(process.cwd(), "mp4.mp4"));
const base64 = videoBuffer.toString("base64");
console.log(`✅ Video: ${Math.round(videoBuffer.length / 1024)}KB`);

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Models to try in order of preference
const MODELS_TO_TRY = [
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-2.5-flash",
];

const systemInstruction = `You are a social media virality analyst. Return ONLY a valid JSON object — no markdown, no code fences. Just raw JSON.`;

const userPrompt = `Analyze this video for TikTok virality. Return this exact JSON with real analysis values:
{
  "hookStrength": { "score": 75, "explanation": "2-3 sentences.", "suggestions": ["tip1", "tip2"] },
  "pacing": { "score": 70, "explanation": "2-3 sentences.", "suggestions": ["tip1"] },
  "visualAppeal": { "score": 80, "explanation": "2-3 sentences.", "suggestions": ["tip1"] },
  "captionOptimization": { "score": 60, "explanation": "2-3 sentences.", "suggestions": ["tip1"] },
  "platformFit": { "score": 72, "explanation": "2-3 sentences.", "suggestions": ["tip1"] },
  "hashtags": ["#viral","#tiktok","#fyp","#creator","#content","#trending","#video","#socialmedia","#growth","#reels"],
  "audioSuggestion": "Upbeat electronic pop with a strong beat drop."
}`;

for (const modelName of MODELS_TO_TRY) {
  console.log(`\n🔄 Trying model: ${modelName}`);
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
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

    const text = result.response.text();
    console.log(`✅ SUCCESS with ${modelName}!`);
    console.log("Response preview:", text.slice(0, 200));

    // Try parse
    const cleaned = text.replace(/^```json\s*/im,"").replace(/^```\s*/im,"").replace(/\s*```\s*$/im,"").trim();
    const parsed = JSON.parse(cleaned);
    console.log("✅ JSON valid! Hook score:", parsed.hookStrength?.score);
    console.log(`\n🎯 USE THIS MODEL: "${modelName}"`);
    process.exit(0);

  } catch (err) {
    const msg = err.message ?? String(err);
    if (msg.includes("429") || msg.includes("quota")) {
      console.log(`  ⚠️  Quota exceeded for ${modelName}`);
    } else if (msg.includes("404") || msg.includes("not found")) {
      console.log(`  ⚠️  Model not found: ${modelName}`);
    } else {
      console.log(`  ❌ Error: ${msg.slice(0, 150)}`);
    }
  }
}

console.log("\n❌ No working model found. Check your API key quota at https://ai.dev/rate-limit");
