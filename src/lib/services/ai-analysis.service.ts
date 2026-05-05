import {
  getGeminiTextModel,
  getGeminiVisionModel,
  GEMINI_MODEL_CHAIN,
} from "@/lib/ai/gemini";
import { getGroqClient, GROQ_MODEL } from "@/lib/ai/groq";
import { buildPrompt } from "@/lib/services/prompt-builder.service";
import { normalize, type RawScores } from "@/lib/services/score-normalization.service";
import type { AnalysisInput, ViralityScore } from "@/lib/types";
import { AIAnalysisError } from "@/lib/types";
import { logger } from "@/lib/logger";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectMimeType(url: string, mediaType: "video" | "image"): string {
  const lower = url.toLowerCase();
  if (mediaType === "video") {
    if (lower.includes(".mov") || lower.includes("quicktime")) return "video/quicktime";
    if (lower.includes(".webm")) return "video/webm";
    return "video/mp4";
  }
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".gif")) return "image/gif";
  if (lower.includes(".webp")) return "image/webp";
  return "image/jpeg";
}

function cleanJson(raw: string): string {
  return raw
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .replace(/,\s*([}\]])/g, "$1") // fix trailing commas
    .trim();
}

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as Record<string, unknown>).status as number | undefined;
  return status === 429 || msg.includes("429") || msg.includes("quota") || msg.includes("rate");
}

/**
 * Call Gemini for caption-only (text) analysis.
 * Tries each model in the chain until one succeeds.
 */
async function callGeminiText(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  let lastError: unknown;

  for (const modelName of GEMINI_MODEL_CHAIN) {
    try {
      logger.info({ model: modelName }, "Trying text model");
      const model = getGeminiTextModel(modelName);
      const result = await model.generateContent({
        systemInstruction,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      });
      logger.info({ model: modelName }, "Text model succeeded");
      return result.response.text();
    } catch (err) {
      lastError = err;
      if (isRateLimitError(err)) {
        logger.warn({ model: modelName }, "Rate limited — trying next model");
        await sleep(1000);
        continue;
      }
      // Non-rate-limit error — don't try other models
      throw err;
    }
  }

  throw new AIAnalysisError(
    `All Gemini models are rate limited. Please wait 1 minute and try again. (${lastError instanceof Error ? lastError.message.slice(0, 100) : "quota exceeded"})`
  );
}

/**
 * Call Gemini for video/image (vision) analysis.
 * Fetches the media from Supabase, then tries each model in the chain.
 */
async function callGeminiVision(
  signedUrl: string,
  mediaType: "video" | "image",
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  // Fetch media once — reuse across model retries
  logger.info({ signedUrl: signedUrl.slice(0, 60) }, "Fetching media from storage");
  const response = await fetch(signedUrl);
  if (!response.ok) {
    throw new AIAnalysisError(
      `Failed to fetch your uploaded file (HTTP ${response.status}). Please upload again and retry.`
    );
  }

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = detectMimeType(signedUrl, mediaType);
  const sizeKB = Math.round(buffer.byteLength / 1024);

  logger.info({ mimeType, sizeKB }, "Media fetched, sending to Gemini");

  let lastError: unknown;

  for (const modelName of GEMINI_MODEL_CHAIN) {
    try {
      logger.info({ model: modelName }, "Trying vision model");
      const model = getGeminiVisionModel(modelName);
      const result = await model.generateContent({
        systemInstruction,
        contents: [
          {
            role: "user",
            parts: [
              { text: userPrompt },
              { inlineData: { mimeType, data: base64 } },
            ],
          },
        ],
      });
      logger.info({ model: modelName }, "Vision model succeeded");
      return result.response.text();
    } catch (err) {
      lastError = err;
      if (isRateLimitError(err)) {
        logger.warn({ model: modelName }, "Rate limited — trying next model");
        await sleep(1000);
        continue;
      }
      // Non-rate-limit error — log and try next model anyway
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ model: modelName, error: msg }, "Vision model error — trying next");
      await sleep(500);
    }
  }

  throw new AIAnalysisError(
    `All Gemini models are rate limited. Please wait 1 minute and try again. (${lastError instanceof Error ? lastError.message.slice(0, 100) : "quota exceeded"})`
  );
}

/**
 * Parse Gemini response into RawScores with multiple fallback strategies.
 */
function parseGeminiResponse(raw: string): RawScores {
  const cleaned = cleanJson(raw);

  try {
    return JSON.parse(cleaned) as RawScores;
  } catch {
    logger.error({ rawSample: cleaned.slice(0, 300) }, "Could not parse Gemini JSON");
    throw new AIAnalysisError("AI returned an unreadable response. Please try again.");
  }
}

/**
 * Enhance suggestions via Groq — completely optional, silent on failure.
 */
async function tryEnhanceWithGroq(rawScores: RawScores): Promise<RawScores> {
  try {
    const tips = [
      ...(rawScores.hookStrength?.suggestions ?? []),
      ...(rawScores.captionOptimization?.suggestions ?? []),
    ].slice(0, 6);

    if (tips.length === 0) return rawScores;

    const completion = await getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: `Rewrite these content improvement tips to be more specific and actionable. Max 15 words each. Return ONLY a JSON array of strings.\n\nTips: ${JSON.stringify(tips)}`,
        },
      ],
      max_tokens: 512,
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";
    const enhanced = JSON.parse(cleanJson(raw)) as string[];
    if (!Array.isArray(enhanced) || enhanced.length === 0) return rawScores;

    const hookCount = rawScores.hookStrength?.suggestions?.length ?? 0;
    return {
      ...rawScores,
      hookStrength: { ...rawScores.hookStrength, suggestions: enhanced.slice(0, hookCount) },
      captionOptimization: { ...rawScores.captionOptimization, suggestions: enhanced.slice(hookCount) },
    };
  } catch (err) {
    logger.warn({ error: err instanceof Error ? err.message : String(err) }, "Groq enhancement skipped");
    return rawScores;
  }
}

/**
 * Main entry point — full analysis pipeline.
 */
export async function analyzeContent(input: AnalysisInput): Promise<ViralityScore> {
  const { systemInstruction, userPrompt } = buildPrompt(
    input.platform,
    input.mediaType,
    input.caption
  );

  logger.info({ mediaType: input.mediaType, platform: input.platform }, "Starting analysis");

  // Call Gemini (with automatic model fallback)
  const rawResponse = input.mediaType === "caption"
    ? await callGeminiText(systemInstruction, userPrompt)
    : await callGeminiVision(input.signedUrl ?? "", input.mediaType, systemInstruction, userPrompt);

  logger.info({ preview: rawResponse.slice(0, 80) }, "Gemini responded");

  // Parse
  const rawScores = parseGeminiResponse(rawResponse);

  // Validate required fields
  if (!rawScores.hookStrength || !rawScores.captionOptimization || !rawScores.platformFit) {
    logger.error({ rawScores }, "Missing required fields in Gemini response");
    throw new AIAnalysisError("AI response was incomplete. Please try again.");
  }

  // Enhance with Groq (best-effort)
  const enhanced = await tryEnhanceWithGroq(rawScores);

  return normalize(enhanced, input.platform);
}
