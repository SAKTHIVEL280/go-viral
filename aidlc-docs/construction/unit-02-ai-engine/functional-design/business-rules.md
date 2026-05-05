# Business Rules — UNIT-02: AI Engine

## BR-08: Score Clamping (PBT-03 Invariant)
- ALL scores returned by AI MUST be clamped to [0, 100]
- `clampScore(value) = Math.max(0, Math.min(100, Math.round(value)))`
- PBT invariant: for any input `n`, `clampScore(n)` is always in [0, 100]

## BR-09: Weighted Score Calculation (PBT-03 Invariant)
- Overall score = sum of (dimensionScore × platformWeight) for all applicable dimensions
- Weights are normalized if pacing/visualAppeal are null (caption-only or image)
- PBT invariant: for any valid dimension scores and platform, `computeWeightedScore()` is always in [0, 100]

## BR-10: Gemini Response Parsing (PBT-02 Round-Trip)
- Gemini must return valid JSON matching the output schema
- If JSON is malformed: retry once, then return HTTP 502 with "AI analysis failed, please try again"
- If a dimension score is missing: default to 50 (neutral), log warning
- PBT round-trip: `JSON.parse(JSON.stringify(viralityScore))` must equal original object

## BR-11: Platform-Specific Dimension Handling
- `pacing` dimension: only analyzed for VIDEO content. Set to `null` for images/captions.
- `visualAppeal` dimension: only analyzed for VIDEO and IMAGE. Set to `null` for caption-only.
- When dimensions are null, their weight is redistributed proportionally to remaining dimensions

## BR-12: Analysis History Limit
- Maximum 20 analyses stored per user
- On 21st analysis: delete the oldest record for that user before inserting new one
- This prevents Supabase free tier storage exhaustion

## BR-13: Groq Fallback
- Groq is used to enhance/rewrite Gemini's suggestion text for better readability
- If Groq API fails (timeout, rate limit): use Gemini suggestions as-is (no error to user)
- Groq call is non-blocking — analysis proceeds with Gemini results if Groq is unavailable

## BR-14: Hashtag Format
- All hashtags must start with `#`
- No spaces within hashtags
- 10–15 hashtags returned
- Mix of high-volume (3–5) and niche (5–7) and trending-adjacent (2–3) tags

## BR-15: Analysis Ownership
- Users can only view their own analyses (enforced by Supabase RLS)
- `GET /api/analysis/[id]` returns 404 (not 403) if analysis doesn't belong to user (prevents enumeration)
