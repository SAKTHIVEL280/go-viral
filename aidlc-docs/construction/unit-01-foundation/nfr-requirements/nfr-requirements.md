# NFR Requirements — UNIT-01: Foundation

## Performance
- Auth page load: < 1.5s (Vercel edge, static)
- Upload API response: < 3s for files up to 200MB (Supabase Storage direct upload)
- Rate limit check: < 50ms (Supabase query with index)
- Middleware JWT validation: < 100ms (Supabase server client)

## Security (Full Enforcement)
- JWT validated server-side on every API request (SECURITY-08)
- HTTP security headers on all responses via next.config.ts (SECURITY-04)
- Input validation with Zod on all API routes (SECURITY-05)
- File type validated by MIME type (not extension) (SECURITY-05)
- API keys in environment variables only (SECURITY-12)
- Rate limiting: 5 req/hour/user on upload + analyze endpoints (SECURITY-11)
- Supabase RLS on all tables (SECURITY-06)
- Structured logging with pino — no PII in logs (SECURITY-03)
- Generic error messages to client (SECURITY-09, SECURITY-15)
- CORS restricted to Vercel deployment domain (SECURITY-08)

## Availability
- Vercel free tier: 99.9% uptime SLA
- Supabase free tier: 99.9% uptime SLA
- Graceful degradation: if Supabase Storage is slow, show upload timeout error (not crash)

## Usability
- WCAG 2.1 AA: keyboard navigation, ARIA labels, color contrast ≥ 4.5:1
- Mobile responsive: works on 375px+ viewport
- Upload progress shown in real-time
- Error messages actionable and user-friendly

## Maintainability
- TypeScript strict mode (`"strict": true` in tsconfig.json)
- ESLint + Prettier configured
- All dependencies pinned to exact versions (SECURITY-10)
- `.env.example` documents all required environment variables
