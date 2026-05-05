import type { Platform, ViralityScore, DimensionScore } from "@/lib/types";
import { PLATFORM_WEIGHTS } from "@/lib/types";

/**
 * Clamps a number to [0, 100].
 * PBT invariant: for any input n, clampScore(n) is always in [0, 100].
 */
export function clampScore(value: number): number {
  if (!isFinite(value) || isNaN(value)) return 50; // default for invalid
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Returns adjusted platform weights when some dimensions are null.
 * Redistributes null dimension weights proportionally to remaining dimensions.
 * PBT invariant: sum of returned weights always equals 1.0
 */
export function getAdjustedWeights(
  platform: Platform,
  nullDimensions: Set<string>
): Record<string, number> {
  const base = PLATFORM_WEIGHTS[platform];
  const active: Record<string, number> = {};
  let nullWeight = 0;

  for (const [dim, weight] of Object.entries(base)) {
    if (nullDimensions.has(dim)) {
      nullWeight += weight;
    } else {
      active[dim] = weight;
    }
  }

  if (nullWeight === 0) return { ...base };

  // Redistribute null weight proportionally
  const activeTotal = Object.values(active).reduce((s, w) => s + w, 0);
  const adjusted: Record<string, number> = {};
  for (const [dim, weight] of Object.entries(active)) {
    adjusted[dim] = weight + (weight / activeTotal) * nullWeight;
  }

  return adjusted;
}

/**
 * Computes weighted overall score from dimension scores.
 * PBT invariant: output always in [0, 100].
 */
export function computeWeightedScore(
  scores: {
    hookStrength: number;
    pacing: number | null;
    visualAppeal: number | null;
    captionOptimization: number;
    platformFit: number;
  },
  platform: Platform
): number {
  const nullDims = new Set<string>();
  if (scores.pacing === null) nullDims.add("pacing");
  if (scores.visualAppeal === null) nullDims.add("visualAppeal");

  const weights = getAdjustedWeights(platform, nullDims);

  let total = 0;
  total += (scores.hookStrength ?? 0) * (weights.hookStrength ?? 0);
  total += (scores.pacing ?? 0) * (weights.pacing ?? 0);
  total += (scores.visualAppeal ?? 0) * (weights.visualAppeal ?? 0);
  total += (scores.captionOptimization ?? 0) * (weights.captionOptimization ?? 0);
  total += (scores.platformFit ?? 0) * (weights.platformFit ?? 0);

  return clampScore(total);
}

/**
 * Normalizes raw AI scores into a validated ViralityScore.
 */
export function normalize(
  raw: RawScores,
  platform: Platform
): ViralityScore {
  const hookStrength = buildDimension(raw.hookStrength);
  const pacing = raw.pacing ? buildDimension(raw.pacing) : null;
  const visualAppeal = raw.visualAppeal ? buildDimension(raw.visualAppeal) : null;
  const captionOptimization = buildDimension(raw.captionOptimization);
  const platformFit = buildDimension(raw.platformFit);

  const overall = computeWeightedScore(
    {
      hookStrength: hookStrength.score,
      pacing: pacing?.score ?? null,
      visualAppeal: visualAppeal?.score ?? null,
      captionOptimization: captionOptimization.score,
      platformFit: platformFit.score,
    },
    platform
  );

  return {
    overall,
    hookStrength,
    pacing,
    visualAppeal,
    captionOptimization,
    platformFit,
    hashtags: (raw.hashtags ?? []).slice(0, 15),
    audioSuggestion: raw.audioSuggestion ?? "Trending upbeat track",
  };
}

function buildDimension(raw: RawDimension): DimensionScore {
  return {
    score: clampScore(raw.score ?? 50),
    explanation: raw.explanation ?? "Analysis complete.",
    suggestions: (raw.suggestions ?? []).slice(0, 3),
  };
}

// ─── Raw types from AI response ──────────────────────────────────────────────

export interface RawDimension {
  score: number;
  explanation: string;
  suggestions: string[];
}

export interface RawScores {
  hookStrength: RawDimension;
  pacing?: RawDimension | null;
  visualAppeal?: RawDimension | null;
  captionOptimization: RawDimension;
  platformFit: RawDimension;
  hashtags: string[];
  audioSuggestion: string;
}
