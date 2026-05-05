# NFR Design Patterns — UNIT-01: Foundation

## Security Patterns

### Pattern: Security Headers Middleware (SECURITY-04)
Applied in `next.config.ts` via `headers()` function:
```typescript
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.groq.com
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

### Pattern: Zod Input Validation (SECURITY-05)
Every API route handler validates request body/params with a Zod schema before processing:
```typescript
const uploadSchema = z.object({
  platform: z.enum(['tiktok', 'instagram', 'youtube_shorts']),
})
// Parse throws ZodError → caught by global error handler → 400 response
```

### Pattern: Fail-Closed Auth (SECURITY-08, SECURITY-15)
```typescript
// In every API route:
const user = await authService.getUser(request)
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
// Never proceed without confirmed user identity
```

### Pattern: Structured Logging (SECURITY-03)
```typescript
// Every API route entry:
logger.info({ requestId, userId, endpoint, method }, 'Request received')
// Every error:
logger.error({ requestId, error: err.message, endpoint }, 'Request failed')
// NEVER log: passwords, tokens, file contents, PII
```

### Pattern: Global Error Handler (SECURITY-15)
```typescript
// app/api/[...]/route.ts wrapper pattern:
try {
  // handler logic
} catch (err) {
  logger.error({ requestId, error: err.message }, 'Unhandled error')
  return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  // Never expose err.message or stack to client
}
```

## Performance Patterns

### Pattern: Presigned Upload URL
Instead of streaming file through API route (slow, memory-intensive):
1. Client requests presigned URL from `/api/upload` (fast, < 100ms)
2. Client uploads directly to Supabase Storage using presigned URL
3. Client reports completion to `/api/analyze`
This keeps API routes lightweight and avoids Vercel function memory limits.

## Resilience Patterns

### Pattern: Rate Limit with Sliding Window
```sql
-- rate_limits table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX rate_limits_user_endpoint_time ON rate_limits(user_id, endpoint, created_at DESC);
-- RLS: users can only see their own rate limit records
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own rate limits" ON rate_limits FOR ALL USING (auth.uid() = user_id);
```
