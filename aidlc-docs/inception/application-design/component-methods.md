# Component Methods — Go Viral Clone

## SVC-01: AIAnalysisService

```typescript
// Main entry point — orchestrates Gemini + Groq pipeline
analyzeContent(input: AnalysisInput): Promise<ViralityReport>

// Sends multimodal content to Gemini 1.5 Flash
callGeminiVision(prompt: GeminiPrompt, mediaUrl: string, mediaType: MediaType): Promise<RawGeminiResponse>

// Sends text-only prompt to Groq for enhanced suggestions
callGroqText(prompt: string): Promise<string>

// Parses Gemini JSON response into typed score object
parseGeminiResponse(raw: RawGeminiResponse): RawScores

// Merges Gemini scores with Groq-enhanced suggestions
mergeAnalysisResults(scores: RawScores, suggestions: string): ViralityReport
```

## SVC-05: ScoreNormalizationService

```typescript
// Clamps score to [0, 100] — PBT invariant target
clampScore(value: number): number  // invariant: output always in [0,100]

// Computes weighted overall score per platform
computeWeightedScore(scores: DimensionScores, platform: Platform): number  // invariant: output in [0,100]

// Validates all required dimensions are present
validateScoreCompleteness(scores: RawScores): ValidationResult

// Full normalization pipeline
normalize(rawScores: RawScores, platform: Platform): ViralityScore
```

## SVC-06: PromptBuilderService

```typescript
// Builds platform-specific Gemini prompt with JSON output schema
buildPrompt(input: AnalysisInput): GeminiPrompt

// Returns platform-specific dimension weights
getPlatformWeights(platform: Platform): PlatformWeights

// Builds the JSON schema instruction for structured output
buildOutputSchema(): string
```

## SVC-02: StorageService

```typescript
// Uploads file buffer to Supabase Storage, returns public/signed URL
uploadFile(file: Buffer, path: string, mimeType: string): Promise<string>

// Generates time-limited signed URL for private bucket access
getSignedUrl(path: string, expiresIn: number): Promise<string>

// Deletes file from storage (cleanup on analysis failure)
deleteFile(path: string): Promise<void>

// Validates file type against allowlist
validateFileType(mimeType: string): boolean

// Validates file size against platform limits
validateFileSize(sizeBytes: number, mediaType: MediaType): boolean
```

## SVC-03: AnalysisRepository

```typescript
// Persists new analysis record (Supabase RLS enforced)
save(analysis: NewAnalysis): Promise<Analysis>

// Fetches single analysis by ID — verifies ownership via RLS
findById(id: string): Promise<Analysis | null>

// Fetches user's analysis history, ordered by created_at desc
findByUser(userId: string, limit: number): Promise<Analysis[]>

// Counts analyses for rate limiting check
countRecentByUser(userId: string, windowMinutes: number): Promise<number>
```

## COMP-10: UploadHandler (API Route)

```typescript
// POST /api/upload
// Validates file, uploads to Supabase Storage, returns storage path
handleUpload(req: NextRequest): Promise<NextResponse<UploadResponse>>
```

## COMP-11: AnalysisHandler (API Route)

```typescript
// POST /api/analyze
// Orchestrates full analysis pipeline, persists result, returns analysis ID
handleAnalyze(req: NextRequest): Promise<NextResponse<AnalyzeResponse>>
```

## COMP-12: HistoryHandler (API Route)

```typescript
// GET /api/history
// Returns paginated analysis history for authenticated user
handleHistory(req: NextRequest): Promise<NextResponse<HistoryResponse>>
```

## COMP-13: AnalysisDetailHandler (API Route)

```typescript
// GET /api/analysis/[id]
// Returns full analysis report — RLS enforces ownership
handleAnalysisDetail(req: NextRequest, params: { id: string }): Promise<NextResponse<AnalysisDetailResponse>>
```

## COMP-14: RateLimitMiddleware

```typescript
// Checks and increments rate limit counter for user
checkRateLimit(userId: string, endpoint: string): Promise<RateLimitResult>

// Returns 429 response with retry-after header
buildRateLimitResponse(retryAfterSeconds: number): NextResponse
```

---

## Core Data Types

```typescript
type MediaType = 'video' | 'image' | 'caption'
type Platform = 'tiktok' | 'instagram' | 'youtube_shorts'

interface AnalysisInput {
  mediaUrl?: string        // Supabase Storage URL (video/image)
  mediaType: MediaType
  caption?: string         // User-provided caption text
  platform: Platform
  userId: string
}

interface DimensionScore {
  score: number            // 0–100
  explanation: string      // 2–3 sentences
  suggestions: string[]    // 1–3 actionable items
}

interface ViralityScore {
  overall: number          // 0–100 weighted composite
  hookStrength: DimensionScore
  pacing: DimensionScore | null   // null for images
  visualAppeal: DimensionScore
  captionOptimization: DimensionScore
  platformFit: DimensionScore
  hashtags: string[]       // 10–15 recommendations
  audioSuggestion: string  // Genre/style recommendation
}

interface ViralityReport {
  scores: ViralityScore
  platform: Platform
  mediaType: MediaType
  analyzedAt: string       // ISO timestamp
}

interface Analysis {
  id: string
  userId: string
  mediaUrl: string | null
  mediaType: MediaType
  platform: Platform
  caption: string | null
  scores: ViralityScore
  createdAt: string
}
```
