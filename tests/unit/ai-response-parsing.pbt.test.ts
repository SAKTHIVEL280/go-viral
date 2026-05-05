import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type { ViralityScore, DimensionScore } from "@/lib/types";

// Domain generator for DimensionScore (PBT-07)
const dimensionScoreArb: fc.Arbitrary<DimensionScore> = fc.record({
  score: fc.integer({ min: 0, max: 100 }),
  explanation: fc.string({ minLength: 1, maxLength: 200 }),
  suggestions: fc.array(fc.string({ minLength: 1, maxLength: 100 }), {
    minLength: 0,
    maxLength: 3,
  }),
});

// Domain generator for ViralityScore (PBT-07)
const viralityScoreArb: fc.Arbitrary<ViralityScore> = fc.record({
  overall: fc.integer({ min: 0, max: 100 }),
  hookStrength: dimensionScoreArb,
  pacing: fc.option(dimensionScoreArb, { nil: null }),
  visualAppeal: fc.option(dimensionScoreArb, { nil: null }),
  captionOptimization: dimensionScoreArb,
  platformFit: dimensionScoreArb,
  hashtags: fc.array(
    fc.string({ minLength: 2, maxLength: 30 }).map((s) => `#${s.replace(/\s/g, "")}`),
    { minLength: 0, maxLength: 15 }
  ),
  audioSuggestion: fc.string({ minLength: 1, maxLength: 200 }),
});

describe("ViralityScore — Round-Trip Serialization (PBT-02)", () => {
  it("JSON.parse(JSON.stringify(score)) equals original score", () => {
    fc.assert(
      fc.property(viralityScoreArb, (score) => {
        const serialized = JSON.stringify(score);
        const deserialized = JSON.parse(serialized) as ViralityScore;

        // Deep equality check
        expect(deserialized.overall).toBe(score.overall);
        expect(deserialized.hookStrength.score).toBe(score.hookStrength.score);
        expect(deserialized.captionOptimization.score).toBe(score.captionOptimization.score);
        expect(deserialized.hashtags).toEqual(score.hashtags);
        expect(deserialized.pacing).toEqual(score.pacing);
        expect(deserialized.visualAppeal).toEqual(score.visualAppeal);

        return true;
      }),
      { seed: 42, numRuns: 500 }
    );
  });

  it("serialized score is valid JSON", () => {
    fc.assert(
      fc.property(viralityScoreArb, (score) => {
        const serialized = JSON.stringify(score);
        expect(() => JSON.parse(serialized)).not.toThrow();
        return true;
      }),
      { seed: 42, numRuns: 500 }
    );
  });
});
