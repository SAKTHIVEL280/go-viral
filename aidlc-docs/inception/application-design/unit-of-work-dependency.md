# Unit of Work Dependencies — Go Viral Clone

## Dependency Matrix

| Unit | Depends On | Dependency Type | Reason |
|---|---|---|---|
| UNIT-01: Foundation | — | None | Starting point |
| UNIT-02: AI Engine | UNIT-01 | Hard dependency | Needs auth session, storage URLs, DB connection, design system tokens |

## Execution Sequence

```
UNIT-01 (Foundation)
    |
    | Provides:
    | - Supabase client (auth + storage + DB)
    | - Design system (neomorphism tokens, base components)
    | - Auth middleware (protected route pattern)
    | - StorageService (upload + signed URLs)
    | - Rate limit middleware
    |
    v
UNIT-02 (AI Engine + Results UI)
    |
    | Produces:
    | - Complete analysis pipeline
    | - Full score UI
    | - History dashboard
    | - Deployed, functional product
```

## Shared Contracts (UNIT-01 → UNIT-02)

| Contract | Defined In | Consumed By |
|---|---|---|
| `Analysis` TypeScript type | `src/lib/types/index.ts` (UNIT-01) | All UNIT-02 components |
| `ViralityScore` TypeScript type | `src/lib/types/index.ts` (UNIT-01) | ScoreGauge, ScoreBreakdownCard |
| Supabase server client | `src/lib/supabase/server.ts` (UNIT-01) | All UNIT-02 API routes |
| Neomorphism CSS classes | `globals.css` / Tailwind config (UNIT-01) | All UNIT-02 UI components |
| `AuthService.getUser()` | `src/lib/services/auth.service.ts` (UNIT-01) | All UNIT-02 API handlers |
| `StorageService.getSignedUrl()` | `src/lib/services/storage.service.ts` (UNIT-01) | AIAnalysisService (UNIT-02) |
| `RateLimitMiddleware` | `src/lib/middleware/rate-limit.ts` (UNIT-01) | AnalysisHandler (UNIT-02) |
| DB schema (`analyses` table) | `supabase/migrations/001_initial_schema.sql` (UNIT-01) | AnalysisRepository (UNIT-02) |
