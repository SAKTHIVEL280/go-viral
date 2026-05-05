# Business Logic Model — UNIT-02: AI Engine

## Analysis Pipeline

```
POST /api/analyze
    → AuthService.getUser()           [fail-closed: 401 if no user]
    → RateLimitMiddleware.check()     [429 if exceeded]
    → Zod schema validation           [400 if invalid]
    → StorageService.getSignedUrl()   [get time-limited URL for Gemini]
    → AIAnalysisService.analyzeContent()
        → PromptBuilderService.buildPrompt(platform, mediaType)
        → Gemini 1.5 Flash API call (multimodal)
            → On 429: wait 4s, retry once
            → On failure: throw AIAnalysisError
        → parseGeminiResponse()       [extract JSON from response]
            → On parse failure: retry Gemini once
        → [optional] Groq API call    [enhance suggestion text]
            → On failure: use Gemini suggestions as-is
        → ScoreNormalizationService.normalize(rawScores, platform)
            → clampScore() on each dimension
            → computeWeightedScore() for overall
        → Return ViralityReport
    → AnalysisRepository.save(report) [persist to Supabase]
    → Return { analysisId }
```

## Gemini Prompt Structure

```
System: You are an expert social media virality analyst. Analyze the provided content for {platform} and return ONLY valid JSON matching this exact schema: {schema}

User: Analyze this {mediaType} content for {platform} virality potential.
Platform: {platform}
Caption: {caption or "none provided"}
[Attached: media file via URL]

Scoring criteria for {platform}:
- Hook Strength (weight: {weight}): First 3 seconds engagement, pattern interrupt, curiosity gap
- Pacing (weight: {weight}): Cut frequency, energy, retention curve
- Visual Appeal (weight: {weight}): Composition, contrast, faces, text overlay
- Caption Optimization (weight: {weight}): Hook words, CTA, length, emoji usage
- Platform Fit (weight: {weight}): Format compliance, trending alignment, algorithm signals

Return ONLY the JSON object, no markdown, no explanation.
```

## Score Normalization Logic

```typescript
function normalize(rawScores: RawScores, platform: Platform): ViralityScore {
  // 1. Clamp all dimension scores
  const clamped = {
    hookStrength: clampScore(rawScores.hookStrength.score),
    pacing: rawScores.pacing ? clampScore(rawScores.pacing.score) : null,
    visualAppeal: rawScores.visualAppeal ? clampScore(rawScores.visualAppeal.score) : null,
    captionOptimization: clampScore(rawScores.captionOptimization.score),
    platformFit: clampScore(rawScores.platformFit.score),
  }

  // 2. Get platform weights, redistribute if dimensions are null
  const weights = getAdjustedWeights(platform, clamped)

  // 3. Compute weighted overall
  const overall = clampScore(
    Object.entries(weights).reduce((sum, [dim, weight]) => {
      return sum + (clamped[dim] ?? 0) * weight
    }, 0)
  )

  return { overall, ...buildDimensionScores(rawScores, clamped) }
}
```

## History Query Logic

```typescript
// Dashboard: last 20 analyses, ordered by created_at DESC
async findByUser(userId: string): Promise<Analysis[]> {
  const { data, error } = await supabase
    .from('analyses')
    .select('id, media_type, platform, scores->overall, created_at, media_url')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw new DatabaseError(error.message)
  return data
}
```

## Testable Properties (PBT-01)

| Function | Property Category | Property |
|---|---|---|
| `clampScore(n)` | Invariant | Output always in [0, 100] |
| `computeWeightedScore(scores, platform)` | Invariant | Output always in [0, 100] |
| `JSON.parse(JSON.stringify(score))` | Round-trip | Parsed object equals original |
| `getAdjustedWeights(platform, scores)` | Invariant | Weights sum to 1.0 |
