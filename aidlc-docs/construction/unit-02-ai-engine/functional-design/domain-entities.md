# Domain Entities — UNIT-02: AI Engine

## Analysis (persisted to DB)
```typescript
interface Analysis {
  id: string              // UUID
  userId: string          // FK to auth.users
  mediaUrl: string | null // Supabase Storage signed URL (null for caption-only)
  mediaType: MediaType    // 'video' | 'image' | 'caption'
  platform: Platform      // 'tiktok' | 'instagram' | 'youtube_shorts'
  caption: string | null
  scores: ViralityScore   // JSONB
  createdAt: string       // ISO timestamp
}
```

## ViralityScore (stored as JSONB)
```typescript
interface DimensionScore {
  score: number           // 0–100 (clamped, invariant)
  explanation: string     // 2–3 sentences
  suggestions: string[]   // 1–3 items
}

interface ViralityScore {
  overall: number                          // 0–100 weighted composite
  hookStrength: DimensionScore
  pacing: DimensionScore | null            // null for images/captions
  visualAppeal: DimensionScore | null      // null for caption-only
  captionOptimization: DimensionScore
  platformFit: DimensionScore
  hashtags: string[]                       // 10–15 items
  audioSuggestion: string
}
```

## AnalysisInput (API request payload)
```typescript
interface AnalysisInput {
  storagePath: string     // From UNIT-01 upload response
  mediaType: MediaType
  platform: Platform
  caption?: string
  userId: string          // From JWT, not from request body
}
```

## PlatformWeights
```typescript
const PLATFORM_WEIGHTS: Record<Platform, Record<string, number>> = {
  tiktok:          { hookStrength: 0.35, pacing: 0.25, visualAppeal: 0.15, captionOptimization: 0.15, platformFit: 0.10 },
  instagram:       { hookStrength: 0.20, pacing: 0.20, visualAppeal: 0.30, captionOptimization: 0.20, platformFit: 0.10 },
  youtube_shorts:  { hookStrength: 0.30, pacing: 0.30, visualAppeal: 0.15, captionOptimization: 0.15, platformFit: 0.10 },
}
// Invariant: sum of weights for any platform = 1.0
```
