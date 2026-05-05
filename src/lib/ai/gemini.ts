import { GoogleGenerativeAI } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "placeholder");
  }
  return _genAI;
}

/**
 * Ordered list of models to try — primary first, fallbacks after.
 * All confirmed to work on the free tier with this API key.
 */
export const GEMINI_MODEL_CHAIN = [
  "gemini-2.5-flash-lite",   // Primary — fast, free, multimodal
  "gemini-flash-lite-latest", // Fallback 1
  "gemini-flash-latest",      // Fallback 2 — slightly slower but reliable
];

/**
 * Text-only model (caption analysis).
 * Uses responseMimeType: "application/json" for guaranteed JSON output.
 */
export function getGeminiTextModel(modelName: string) {
  return getGenAI().getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  });
}

/**
 * Vision model (video + image analysis).
 * Does NOT use responseMimeType — incompatible with multimodal inline data.
 * JSON output is enforced via the prompt.
 */
export function getGeminiVisionModel(modelName: string) {
  return getGenAI().getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  });
}
