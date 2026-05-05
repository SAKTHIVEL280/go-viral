# NFR Requirements — UNIT-02: AI Engine

## Performance
- Gemini analysis (image/caption): < 15 seconds end-to-end
- Gemini analysis (video up to 2min): < 30 seconds end-to-end
- Groq suggestion enhancement: < 3 seconds (non-blocking, parallel with DB save)
- DB save (analysis record): < 500ms
- History query (20 records): < 200ms

## AI API Quota Management
- Gemini free tier: 15 RPM → rate limit enforced at 5/hour/user (well within limit)
- Groq free tier: 14,400 req/day → non-critical path, graceful fallback if unavailable
- Implement exponential backoff on 429 responses (1 retry after 4s)

## Security (Full Enforcement)
- AI API keys (GEMINI_API_KEY, GROQ_API_KEY) in server-side env vars only (SECURITY-12)
- Gemini/Groq API calls made server-side only — keys never exposed to browser (SECURITY-12)
- Analysis ownership enforced by RLS + application layer (SECURITY-08)
- Return 404 (not 403) for unauthorized analysis access (prevents enumeration) (SECURITY-08)
- AI response parsed and validated before storage — no raw AI output stored (SECURITY-13)

## PBT Requirements (Partial Enforcement — PBT-02, PBT-03, PBT-07, PBT-08, PBT-09)
- `clampScore`: invariant test with fast-check (any number → [0,100])
- `computeWeightedScore`: invariant test (any valid scores + platform → [0,100])
- `ViralityScore` serialization: round-trip test (parse(stringify(x)) equals x)
- `getAdjustedWeights`: invariant test (weights sum to 1.0)
- Framework: fast-check with Vitest
- CI: seed logged on every run

## Reliability
- Gemini failure: 1 retry, then 502 to user with friendly message
- Groq failure: silent fallback to Gemini suggestions
- DB save failure: 500 to user, log error with correlation ID
- Analysis history overflow (>20): auto-delete oldest before insert
