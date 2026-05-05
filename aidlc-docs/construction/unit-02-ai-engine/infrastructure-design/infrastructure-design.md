# Infrastructure Design — UNIT-02: AI Engine

## Additional Environment Variables

```bash
# .env.example additions for UNIT-02
GEMINI_API_KEY=AIza...          # Google AI Studio — server-side only
GROQ_API_KEY=gsk_...            # Groq console — server-side only
```

## Supabase: Additional DB Objects

```sql
-- analyses table (from application-design.md)
CREATE TABLE analyses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url   TEXT,
  media_type  TEXT NOT NULL CHECK (media_type IN ('video', 'image', 'caption')),
  platform    TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube_shorts')),
  caption     TEXT,
  scores      JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their analyses"
  ON analyses FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX analyses_user_created ON analyses(user_id, created_at DESC);
```

## Vercel: Additional Serverless Functions

```
POST /api/analyze          → ~30s timeout (video analysis)
GET  /api/history          → ~5s timeout
GET  /api/analysis/[id]    → ~5s timeout
```

Note: Vercel hobby plan has 10s default timeout. For video analysis (up to 30s), configure:
```json
// vercel.json
{
  "functions": {
    "src/app/api/analyze/route.ts": {
      "maxDuration": 60
    }
  }
}
```

## Gemini API Configuration

```typescript
// src/lib/ai/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',  // Force JSON output
    temperature: 0.3,                       // Low temp for consistent scoring
    maxOutputTokens: 2048,
  }
})
```

## Groq API Configuration

```typescript
// src/lib/ai/groq.ts
import Groq from 'groq-sdk'

export const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY! })
// Model: llama-3.1-70b-versatile (free tier)
// Max tokens: 1024 (suggestions only, not full analysis)
```
