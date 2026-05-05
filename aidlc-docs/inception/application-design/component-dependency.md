# Component Dependencies — Go Viral Clone

## Dependency Matrix

| Component | Depends On | Communication |
|---|---|---|
| LandingPage | AuthService | Supabase client (browser) |
| AuthPage | AuthService | Supabase client (browser) |
| DashboardPage | HistoryHandler | HTTP GET /api/history |
| UploadPage | UploadHandler, AnalysisHandler | HTTP POST /api/upload, /api/analyze |
| AnalysisResultPage | AnalysisDetailHandler | HTTP GET /api/analysis/[id] |
| UploadHandler | StorageService, RateLimitMiddleware | Direct import |
| AnalysisHandler | AIAnalysisService, AnalysisRepository, RateLimitMiddleware | Direct import |
| HistoryHandler | AnalysisRepository, AuthService | Direct import |
| AnalysisDetailHandler | AnalysisRepository, AuthService | Direct import |
| AIAnalysisService | PromptBuilderService, ScoreNormalizationService, Gemini API, Groq API | Direct import + HTTP |
| StorageService | Supabase Storage | Supabase SDK |
| AnalysisRepository | Supabase PostgreSQL | Supabase SDK |
| AuthService | Supabase Auth | Supabase SDK |
| ScoreNormalizationService | — | Pure functions, no deps |
| PromptBuilderService | — | Pure functions, no deps |

---

## Data Flow: Upload + Analyze

```
User (Browser)
  |
  | 1. POST /api/upload (multipart)
  v
UploadHandler
  | -- RateLimitMiddleware.checkRateLimit()
  | -- StorageService.validateFileType()
  | -- StorageService.validateFileSize()
  | -- StorageService.uploadFile()
  |    --> Supabase Storage
  | returns { storagePath, signedUrl }
  |
  | 2. POST /api/analyze (JSON)
  v
AnalysisHandler
  | -- RateLimitMiddleware.checkRateLimit()
  | -- AuthService.getUser()
  | -- AIAnalysisService.analyzeContent()
  |    --> PromptBuilderService.buildPrompt()
  |    --> Gemini 1.5 Flash API (vision)
  |    --> [optional] Groq API (text)
  |    --> ScoreNormalizationService.normalize()
  | -- AnalysisRepository.save()
  |    --> Supabase PostgreSQL
  | returns { analysisId }
  |
  | 3. GET /api/analysis/[id]
  v
AnalysisDetailHandler
  | -- AuthService.getUser()
  | -- AnalysisRepository.findById()  [RLS enforces ownership]
  |    --> Supabase PostgreSQL
  | returns ViralityReport
  |
  v
AnalysisResultPage (renders neomorphic score UI)
```

---

## External Service Dependencies

| Service | Provider | Free Tier Limit | Used By |
|---|---|---|---|
| Gemini 1.5 Flash | Google AI | 15 RPM, 1M tokens/day | AIAnalysisService |
| Groq (Llama 3.1 70B) | Groq | 14,400 req/day | AIAnalysisService |
| Supabase Auth | Supabase | 50,000 MAU | AuthService |
| Supabase Storage | Supabase | 1GB | StorageService |
| Supabase PostgreSQL | Supabase | 500MB | AnalysisRepository |
| Vercel Serverless | Vercel | 100GB bandwidth | All API routes |

---

## Security Boundaries

```
PUBLIC (no auth):
  GET  /                    → LandingPage
  GET  /auth                → AuthPage
  POST /auth/callback       → Supabase OAuth callback

PROTECTED (JWT required, validated server-side):
  GET  /dashboard           → DashboardPage
  GET  /upload              → UploadPage
  GET  /analysis/[id]       → AnalysisResultPage
  POST /api/upload          → UploadHandler
  POST /api/analyze         → AnalysisHandler
  GET  /api/history         → HistoryHandler
  GET  /api/analysis/[id]   → AnalysisDetailHandler
```
