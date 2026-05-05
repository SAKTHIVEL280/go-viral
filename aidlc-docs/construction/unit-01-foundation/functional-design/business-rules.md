# Business Rules — UNIT-01: Foundation

## BR-01: File Type Validation
- ALLOWED video MIME types: `video/mp4`, `video/quicktime` (MOV), `video/webm`
- ALLOWED image MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Validation occurs BEFORE upload to storage (fail fast)
- Return HTTP 400 with message: "Unsupported file type. Please upload MP4, MOV, WebM, JPG, PNG, GIF, or WebP."

## BR-02: File Size Validation
- Video: max 200MB. Return HTTP 413 if exceeded.
- Image: max 10MB. Return HTTP 413 if exceeded.
- Validation occurs BEFORE upload (check Content-Length header)

## BR-03: Authentication Enforcement
- All routes under `/dashboard`, `/upload`, `/analysis/*` require valid Supabase JWT
- All API routes under `/api/*` (except auth callbacks) require valid JWT
- JWT validated server-side using Supabase server client on EVERY request
- Invalid/expired JWT → HTTP 401, redirect to `/auth`
- Never trust client-side auth state for API authorization

## BR-04: Rate Limiting
- Limit: 5 analyses per user per 60-minute rolling window
- Applies to: `POST /api/upload` and `POST /api/analyze`
- On breach: HTTP 429 with `Retry-After` header (seconds until window resets)
- Counter stored in Supabase `rate_limits` table or in-memory (Vercel edge)

## BR-05: Storage Path Convention
- Path format: `{userId}/{Date.now()}-{sanitizedFilename}`
- Filename sanitization: replace spaces with `-`, remove special chars except `.` and `-`
- Bucket: `media-uploads` (private, RLS enforced)
- Signed URL expiry: 3600 seconds (1 hour) — sufficient for AI processing

## BR-06: Session Management
- Sessions expire per Supabase default (1 hour access token, 7 day refresh)
- On logout: call `supabase.auth.signOut()` — invalidates server-side session
- Redirect to `/auth` after logout
- `Secure`, `HttpOnly`, `SameSite=Lax` cookie attributes enforced by Supabase

## BR-07: Neomorphism Design System Rules
- Base background: `#1a1a2e` (dark navy)
- Card background: `#16213e` (slightly lighter)
- Neomorphic shadow (outset): `box-shadow: 6px 6px 12px rgba(0,0,0,0.5), -6px -6px 12px rgba(255,255,255,0.03)`
- Neomorphic shadow (inset): `box-shadow: inset 4px 4px 8px rgba(0,0,0,0.5), inset -4px -4px 8px rgba(255,255,255,0.03)`
- Accent purple: `#7c3aed`, Accent cyan: `#06b6d4`, Accent pink: `#ec4899`
- All interactive elements must have `:hover` and `:focus-visible` states
- Focus ring: `outline: 2px solid #7c3aed; outline-offset: 2px` (WCAG 2.1 AA)
