import type { Platform, MediaType } from "@/lib/types";
import { PLATFORM_WEIGHTS, PLATFORM_LABELS } from "@/lib/types";

export interface GeminiPrompt {
  systemInstruction: string;
  userPrompt: string;
}

/**
 * Exact JSON example Gemini must replicate.
 * Using a concrete example (not placeholders) produces far more reliable output.
 */
const OUTPUT_EXAMPLE = `{
  "hookStrength": {
    "score": 72,
    "explanation": "The opening grabs attention with strong visual contrast but lacks a clear curiosity gap.",
    "suggestions": ["Start with a bold statement or question in the first second", "Add text overlay to the first frame"]
  },
  "pacing": {
    "score": 65,
    "explanation": "Cuts are consistent but the energy dips in the middle section.",
    "suggestions": ["Tighten the middle section by 2 seconds", "Add a beat drop or transition at the 3-second mark"]
  },
  "visualAppeal": {
    "score": 80,
    "explanation": "Good lighting and composition. The color grading is warm and consistent.",
    "suggestions": ["Increase contrast slightly for thumbnail impact"]
  },
  "captionOptimization": {
    "score": 55,
    "explanation": "Caption is too long and lacks a clear call to action.",
    "suggestions": ["Lead with a hook question", "Add a CTA in the last line", "Trim to under 150 characters"]
  },
  "platformFit": {
    "score": 78,
    "explanation": "Format and length are well-suited for this platform.",
    "suggestions": ["Add trending audio to boost algorithmic reach"]
  },
  "hashtags": ["#contentcreator", "#viral", "#socialmedia", "#growthhack", "#tiktok", "#reels", "#trending", "#fyp", "#creator", "#videocontent"],
  "audioSuggestion": "Upbeat electronic pop with a strong beat drop around 3 seconds — trending on this platform this week."
}`;

export function buildPrompt(
  platform: Platform,
  mediaType: MediaType,
  caption?: string
): GeminiPrompt {
  const weights = PLATFORM_WEIGHTS[platform];
  const platformLabel = PLATFORM_LABELS[platform];

  const isPacingApplicable = mediaType === "video";
  const isVisualApplicable = mediaType !== "caption";

  const systemInstruction = `You are a world-class social media virality analyst. Your job is to analyze content and return a JSON virality report. You MUST return ONLY a valid JSON object — no markdown, no code fences, no explanation text before or after. Just the raw JSON.`;

  const nullInstructions = [
    !isPacingApplicable ? `"pacing": null` : null,
    !isVisualApplicable ? `"visualAppeal": null` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const userPrompt = `Analyze this ${mediaType} content for ${platformLabel} and return a virality report as a JSON object.

PLATFORM: ${platformLabel}
CONTENT TYPE: ${mediaType}
CAPTION: ${caption ? `"${caption}"` : "none"}

SCORING WEIGHTS FOR ${platformLabel.toUpperCase()}:
- hookStrength: ${weights.hookStrength} (most important for ${platformLabel})
- pacing: ${weights.pacing}${!isPacingApplicable ? " — NOT APPLICABLE for this content type, set to null" : ""}
- visualAppeal: ${weights.visualAppeal}${!isVisualApplicable ? " — NOT APPLICABLE for caption-only, set to null" : ""}
- captionOptimization: ${weights.captionOptimization}
- platformFit: ${weights.platformFit}

RULES:
- All scores must be integers between 0 and 100
- Each explanation must be 2-3 sentences
- Each suggestions array must have 1-3 specific, actionable tips
- hashtags: exactly 10-15 tags, all starting with #, no spaces inside tags
- audioSuggestion: one sentence describing the ideal audio style/genre
${nullInstructions ? `- Set these fields to null: ${nullInstructions}` : ""}

Return ONLY a JSON object in this exact structure (replace the example values with your real analysis):
${OUTPUT_EXAMPLE}`;

  return { systemInstruction, userPrompt };
}
