# NFR Design Patterns — UNIT-02: AI Engine

## Pattern: Retry with Exponential Backoff (Gemini)
```typescript
async function callGeminiWithRetry(prompt, mediaUrl, attempt = 0): Promise<string> {
  try {
    return await callGemini(prompt, mediaUrl)
  } catch (err) {
    if (err.status === 429 && attempt === 0) {
      await sleep(4000)
      return callGeminiWithRetry(prompt, mediaUrl, 1)
    }
    throw new AIAnalysisError('Gemini analysis failed: ' + err.message)
  }
}
```

## Pattern: Graceful Groq Fallback
```typescript
async function enhanceSuggestions(geminiSuggestions: string[]): Promise<string[]> {
  try {
    const enhanced = await callGroq(buildGroqPrompt(geminiSuggestions))
    return parseGroqSuggestions(enhanced)
  } catch {
    // Silent fallback — Groq is enhancement only, not critical path
    return geminiSuggestions
  }
}
```

## Pattern: PBT Test Structure (fast-check + Vitest)
```typescript
// tests/unit/score-normalization.test.ts
import fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import { clampScore, computeWeightedScore } from '@/lib/services/score-normalization.service'

describe('ScoreNormalizationService — PBT', () => {
  it('clampScore: output always in [0, 100]', () => {
    fc.assert(
      fc.property(fc.float({ noNaN: true }), (n) => {
        const result = clampScore(n)
        return result >= 0 && result <= 100
      }),
      { seed: 42, numRuns: 1000 }  // Fixed seed for CI reproducibility (PBT-08)
    )
  })

  it('computeWeightedScore: output always in [0, 100]', () => {
    const scoreArb = fc.record({
      hookStrength: fc.integer({ min: 0, max: 100 }),
      pacing: fc.option(fc.integer({ min: 0, max: 100 })),
      visualAppeal: fc.option(fc.integer({ min: 0, max: 100 })),
      captionOptimization: fc.integer({ min: 0, max: 100 }),
      platformFit: fc.integer({ min: 0, max: 100 }),
    })
    const platformArb = fc.constantFrom('tiktok', 'instagram', 'youtube_shorts')

    fc.assert(
      fc.property(scoreArb, platformArb, (scores, platform) => {
        const result = computeWeightedScore(scores, platform)
        return result >= 0 && result <= 100
      }),
      { seed: 42, numRuns: 1000 }
    )
  })
})
```

## Pattern: AI Response Validation
```typescript
const viralityScoreSchema = z.object({
  hookStrength: dimensionScoreSchema,
  pacing: dimensionScoreSchema.nullable(),
  visualAppeal: dimensionScoreSchema.nullable(),
  captionOptimization: dimensionScoreSchema,
  platformFit: dimensionScoreSchema,
  hashtags: z.array(z.string().startsWith('#')).min(10).max(15),
  audioSuggestion: z.string().min(1),
})
// Parse Gemini JSON through this schema before any processing
```

## Pattern: History Overflow Management
```typescript
async function saveWithOverflowCheck(analysis: NewAnalysis): Promise<Analysis> {
  const count = await countByUser(analysis.userId)
  if (count >= 20) {
    await deleteOldest(analysis.userId)  // Delete oldest before insert
  }
  return save(analysis)
}
```
