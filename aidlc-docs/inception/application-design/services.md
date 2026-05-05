# Service Definitions — Go Viral Clone

## Service Architecture Overview

```
Browser (Next.js Frontend)
        |
        | HTTPS
        v
[Next.js API Routes — Vercel Serverless]
        |
   +---------+----------+----------+
   |         |          |          |
   v         v          v          v
[Supabase  [Gemini   [Groq      [Supabase
 Storage]   1.5 Flash] API]      PostgreSQL]
```

---

## SVC-01: AIAnalysisService

**Type**: Application Service (stateless)
**Location**: `src/lib/services/ai-analysis.service.ts`

**Responsibilities**:
- Orchestrates the full AI analysis pipeline
- Selects appropriate Gemini model call based on media type (vision for video/image, text for caption-only)
- Calls Groq for fast, enhanced suggestion text when Gemini quota is tight
- Returns a fully typed `ViralityReport`

**Orchestration Flow**:
```
AnalysisInput
    → PromptBuilderService.buildPrompt()
    → Gemini 1.5 Flash API (multimodal)
    → parseGeminiResponse()
    → [optional] Groq API (enhanced suggestions)
    → ScoreNormalizationService.normalize()
    → ViralityReport
```

**External Dependencies**: Google Gemini API, Groq API
**Error Handling**: Retries once on 429 (rate limit), throws `AIAnalysisError` on failure

---

## SVC-02: StorageService

**Type**: Infrastructure Service
**Location**: `src/lib/services/storage.service.ts`

**Responsibilities**:
- Abstracts Supabase Storage operations
- Enforces file type and size validation before upload
- Generates storage paths with user-scoped prefixes (`{userId}/{timestamp}-{filename}`)
- Provides signed URLs for private bucket access

**Storage Bucket**: `media-uploads` (private, RLS enforced)
**Path Convention**: `{userId}/{analysisId}/{filename}`

---

## SVC-03: AnalysisRepository

**Type**: Data Access Service
**Location**: `src/lib/repositories/analysis.repository.ts`

**Responsibilities**:
- All database operations for `analyses` table
- Supabase RLS automatically enforces user ownership — no manual ownership checks needed in application code
- Provides typed query results

**Table**: `analyses`
**RLS Policy**: Users can only SELECT/INSERT/DELETE their own rows (`auth.uid() = user_id`)

---

## SVC-04: AuthService

**Type**: Infrastructure Service
**Location**: `src/lib/services/auth.service.ts`

**Responsibilities**:
- Wraps Supabase Auth client
- Provides server-side session validation for API routes
- Used by all protected API routes to extract and validate the calling user

**Session Validation**: Validates JWT signature, expiration, audience via Supabase server client

---

## SVC-05: ScoreNormalizationService

**Type**: Pure Domain Service (no I/O)
**Location**: `src/lib/services/score-normalization.service.ts`

**Responsibilities**:
- All score math is isolated here — no score calculations in API handlers
- Platform-specific weights defined as constants
- PBT targets: `clampScore` (invariant: output in [0,100]), `computeWeightedScore` (invariant: output in [0,100])

**Platform Weights** (configurable):
```
TikTok:          hookStrength=0.35, pacing=0.25, visualAppeal=0.15, caption=0.15, platformFit=0.10
Instagram:       hookStrength=0.20, pacing=0.20, visualAppeal=0.30, caption=0.20, platformFit=0.10
YouTube Shorts:  hookStrength=0.30, pacing=0.30, visualAppeal=0.15, caption=0.15, platformFit=0.10
```

---

## SVC-06: PromptBuilderService

**Type**: Pure Domain Service (no I/O)
**Location**: `src/lib/services/prompt-builder.service.ts`

**Responsibilities**:
- Builds structured Gemini prompts that request JSON output
- Injects platform context and scoring criteria into prompt
- Defines the exact JSON schema Gemini must return (enforced via prompt engineering)

**Output Schema** (injected into prompt):
```json
{
  "hookStrength": { "score": 0-100, "explanation": "...", "suggestions": ["..."] },
  "pacing": { "score": 0-100, "explanation": "...", "suggestions": ["..."] },
  "visualAppeal": { "score": 0-100, "explanation": "...", "suggestions": ["..."] },
  "captionOptimization": { "score": 0-100, "explanation": "...", "suggestions": ["..."] },
  "platformFit": { "score": 0-100, "explanation": "...", "suggestions": ["..."] },
  "hashtags": ["#tag1", "#tag2", ...],
  "audioSuggestion": "..."
}
```
