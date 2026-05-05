import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  clampScore,
  computeWeightedScore,
  getAdjustedWeights,
} from "@/lib/services/score-normalization.service";
import type { Platform } from "@/lib/types";

// Domain-specific generators (PBT-07)
const platformArb = fc.constantFrom<Platform>(
  "tiktok",
  "instagram",
  "youtube_shorts"
);

const dimensionScoreArb = fc.integer({ min: 0, max: 100 });

const rawScoresArb = fc.record({
  hookStrength: dimensionScoreArb,
  pacing: fc.option(dimensionScoreArb, { nil: null }),
  visualAppeal: fc.option(dimensionScoreArb, { nil: null }),
  captionOptimization: dimensionScoreArb,
  platformFit: dimensionScoreArb,
});

describe("ScoreNormalizationService — Property-Based Tests", () => {
  // PBT-03: Invariant — clampScore output always in [0, 100]
  it("clampScore: output always in [0, 100] for any finite number", () => {
    fc.assert(
      fc.property(fc.float({ noNaN: true, noDefaultInfinity: true }), (n) => {
        const result = clampScore(n);
        return result >= 0 && result <= 100;
      }),
      { seed: 42, numRuns: 1000 }
    );
  });

  it("clampScore: output always in [0, 100] for extreme integers", () => {
    fc.assert(
      fc.property(fc.integer({ min: -1_000_000, max: 1_000_000 }), (n) => {
        const result = clampScore(n);
        return result >= 0 && result <= 100;
      }),
      { seed: 42, numRuns: 1000 }
    );
  });

  // PBT-03: Invariant — computeWeightedScore output always in [0, 100]
  it("computeWeightedScore: output always in [0, 100]", () => {
    fc.assert(
      fc.property(rawScoresArb, platformArb, (scores, platform) => {
        const result = computeWeightedScore(scores, platform);
        return result >= 0 && result <= 100;
      }),
      { seed: 42, numRuns: 1000 }
    );
  });

  // PBT-03: Invariant — adjusted weights always sum to 1.0
  it("getAdjustedWeights: weights always sum to 1.0", () => {
    const nullDimsArb = fc.subarray(["pacing", "visualAppeal"], {
      minLength: 0,
      maxLength: 2,
    });

    fc.assert(
      fc.property(platformArb, nullDimsArb, (platform, nullDims) => {
        const weights = getAdjustedWeights(platform, new Set(nullDims));
        const sum = Object.values(weights).reduce((s, w) => s + w, 0);
        return Math.abs(sum - 1.0) < 0.0001; // floating point tolerance
      }),
      { seed: 42, numRuns: 500 }
    );
  });
});
