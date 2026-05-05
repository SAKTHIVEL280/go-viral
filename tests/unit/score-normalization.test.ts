import { describe, it, expect } from "vitest";
import {
  clampScore,
  computeWeightedScore,
} from "@/lib/services/score-normalization.service";

describe("ScoreNormalizationService — Example-Based Tests", () => {
  describe("clampScore", () => {
    it("returns 0 for negative values", () => {
      expect(clampScore(-1)).toBe(0);
      expect(clampScore(-100)).toBe(0);
    });

    it("returns 100 for values above 100", () => {
      expect(clampScore(101)).toBe(100);
      expect(clampScore(999)).toBe(100);
    });

    it("returns the value for values in [0, 100]", () => {
      expect(clampScore(0)).toBe(0);
      expect(clampScore(50)).toBe(50);
      expect(clampScore(100)).toBe(100);
    });

    it("rounds decimal values", () => {
      expect(clampScore(75.6)).toBe(76);
      expect(clampScore(75.4)).toBe(75);
    });

    it("returns 50 for NaN", () => {
      expect(clampScore(NaN)).toBe(50);
    });

    it("returns 50 for Infinity", () => {
      expect(clampScore(Infinity)).toBe(50);
      expect(clampScore(-Infinity)).toBe(50);
    });
  });

  describe("computeWeightedScore", () => {
    it("computes correct weighted score for TikTok with all dimensions", () => {
      const scores = {
        hookStrength: 80,
        pacing: 70,
        visualAppeal: 60,
        captionOptimization: 50,
        platformFit: 90,
      };
      // TikTok: hook=0.35, pacing=0.25, visual=0.15, caption=0.15, platform=0.10
      // = 80*0.35 + 70*0.25 + 60*0.15 + 50*0.15 + 90*0.10
      // = 28 + 17.5 + 9 + 7.5 + 9 = 71
      const result = computeWeightedScore(scores, "tiktok");
      expect(result).toBe(71);
    });

    it("handles null pacing (image content)", () => {
      const scores = {
        hookStrength: 80,
        pacing: null,
        visualAppeal: 70,
        captionOptimization: 60,
        platformFit: 75,
      };
      const result = computeWeightedScore(scores, "tiktok");
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it("handles all null optional dimensions (caption-only)", () => {
      const scores = {
        hookStrength: 80,
        pacing: null,
        visualAppeal: null,
        captionOptimization: 70,
        platformFit: 65,
      };
      const result = computeWeightedScore(scores, "instagram");
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });
});
