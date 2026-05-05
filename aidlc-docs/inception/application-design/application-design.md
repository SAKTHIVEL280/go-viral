# Application Design — Go Viral Clone: AI Content Virality Analyzer

## Overview

Full-stack Next.js 14 web application deployed on Vercel + Supabase. Single monorepo, two units of work.

---

## Architecture Summary

```
+--------------------------------------------------+
|              BROWSER (Next.js Frontend)           |
|  Landing | Auth | Dashboard | Upload | Results    |
|  [Neomorphism UI — Tailwind + shadcn/ui + Framer] |
+--------------------------------------------------+
                        |  HTTPS
+--------------------------------------------------+
|         NEXT.JS API ROUTES (Vercel Serverless)    |
|  /api/upload  /api/analyze  /api/history          |
|  /api/analysis/[id]                               |
|  [RateLimitMiddleware] [AuthService]              |
+--------------------------------------------------+
        |              |              |
+----------+   +-------------+   +----------+
| Supabase |   | Gemini 1.5  |   |  Groq    |
| Storage  |   | Flash API   |   |  API     |
| Auth     |   | (vision)    |   | (text)   |
| Postgres |   +-------------+   +----------+
+----------+
```

---

## Components

See: [components.md](./components.md)

**Frontend (9 components)**: LandingPage, AuthPage, DashboardPage, UploadPage, AnalysisResultPage, ScoreGauge, ScoreBreakdownCard, UploadDropzone, NavigationBar

**Backend API (5 components)**: UploadHandler, AnalysisHandler, HistoryHandler, AnalysisDetailHandler, RateLimitMiddleware

---

## Services

See: [services.md](./services.md)

| Service | Type | Purpose |
|---|---|---|
| AIAnalysisService | Application | Gemini + Groq orchestration |
| StorageService | Infrastructure | Supabase Storage abstraction |
| AnalysisRepository | Data Access | PostgreSQL CRUD + RLS |
| AuthService | Infrastructure | Supabase Auth wrapper |
| ScoreNormalizationService | Pure Domain | Score math + platform weights |
| PromptBuilderService | Pure Domain | Gemini prompt construction |

---

## Component Methods

See: [component-methods.md](./component-methods.md)

Key PBT targets (partial enforcement):
- `ScoreNormalizationService.clampScore()` — invariant: output always in [0,100]
- `ScoreNormalizationService.computeWeightedScore()` — invariant: output always in [0,100]
- AI response parsing — round-trip: parsed object serializes back to equivalent JSON

---

## Component Dependencies

See: [component-dependency.md](./component-dependency.md)

Critical path: `UploadPage → UploadHandler → StorageService → Supabase Storage → AnalysisHandler → AIAnalysisService → Gemini API → ScoreNormalizationService → AnalysisRepository → Supabase DB → AnalysisResultPage`

---

## Units of Work

See: [unit-of-work.md](./unit-of-work.md) | [unit-of-work-dependency.md](./unit-of-work-dependency.md) | [unit-of-work-story-map.md](./unit-of-work-story-map.md)

| Unit | Name | Deliverable |
|---|---|---|
| UNIT-01 | Foundation — Auth, Upload & Storage | Deployable app: sign up, log in, upload files |
| UNIT-02 | AI Analysis Engine & Results UI | Complete product: upload → analyze → score report |

---

## UI/UX Design Direction

**Style**: Neomorphism (soft UI) on dark base (`#1a1a2e` / `#16213e`)
- Dual-shadow system: dark shadow + light highlight on all cards
- Accent colors: electric purple `#7c3aed`, neon cyan `#06b6d4`, hot pink `#ec4899`
- Animated score gauge (Framer Motion circular progress)
- Glassmorphism overlays on modals
- Inter / Plus Jakarta Sans typography
- Color-coded scores: red (0–40), amber (41–70), green (71–100)

---

## Database Schema (Supabase PostgreSQL)

```sql
-- Users managed by Supabase Auth (auth.users table)

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

-- RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their analyses"
  ON analyses FOR ALL
  USING (auth.uid() = user_id);

-- Index for history queries
CREATE INDEX analyses_user_created ON analyses(user_id, created_at DESC);
```

---

## Security Design (SECURITY-01 to SECURITY-15)

| Rule | Implementation |
|---|---|
| SECURITY-01 | Supabase encrypts at rest; all connections TLS 1.2+ |
| SECURITY-02 | Vercel access logs enabled; Supabase audit logs |
| SECURITY-03 | Structured logger (pino) with correlation IDs on all API routes |
| SECURITY-04 | next.config.ts security headers (CSP, HSTS, X-Frame-Options, etc.) |
| SECURITY-05 | Zod schemas on all API route inputs |
| SECURITY-06 | Supabase RLS (least privilege); env-scoped API keys |
| SECURITY-07 | Vercel handles network; Supabase private bucket |
| SECURITY-08 | JWT validated server-side on every protected route; RLS for IDOR prevention |
| SECURITY-09 | Generic error responses; no stack traces to client |
| SECURITY-10 | package-lock.json committed; exact versions pinned |
| SECURITY-11 | Auth logic isolated in AuthService; rate limiting on public endpoints |
| SECURITY-12 | Supabase Auth handles password hashing, MFA, brute-force protection |
| SECURITY-13 | No unsafe deserialization; SRI on any CDN scripts |
| SECURITY-14 | Vercel log retention; alerts on repeated 401/429 patterns |
| SECURITY-15 | Global error handler in Next.js; fail-closed on auth errors |
