# Business Logic Model — UNIT-01: Foundation

## Auth Flow

```
User visits protected route
    → middleware.ts checks Supabase session cookie
    → No session → redirect to /auth
    → Valid session → allow through

User submits login form
    → client-side validation (email format, password length)
    → supabase.auth.signInWithPassword({ email, password })
    → Success → redirect to /dashboard
    → Error → display generic "Invalid credentials" message (never expose which field is wrong)

User clicks Google OAuth
    → supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback' })
    → Supabase handles OAuth flow
    → Callback → supabase.auth.exchangeCodeForSession()
    → Redirect to /dashboard

User logs out
    → supabase.auth.signOut()
    → Clear local session
    → Redirect to /
```

## Upload Flow

```
User selects file (drag-drop or picker)
    → Client validates: file type in allowlist?
        → No → show error, reject
        → Yes → show preview
    → Client validates: file size within limit?
        → No → show error, reject
        → Yes → enable upload

User clicks "Analyze" (platform selected + file ready)
    → POST /api/upload (multipart/form-data)
        → Server: validate JWT (AuthService.getUser())
        → Server: RateLimitMiddleware.checkRateLimit()
            → Limit exceeded → 429 response
        → Server: StorageService.validateFileType()
        → Server: StorageService.validateFileSize()
        → Server: StorageService.uploadFile()
            → Supabase Storage upload
            → Returns storagePath + signedUrl
        → Response: { storagePath, signedUrl, mediaType }
    → [UNIT-02] POST /api/analyze with storagePath + platform + caption
```

## Rate Limit Logic

```
checkRateLimit(userId, endpoint):
    windowStart = now() - 3600 seconds
    count = SELECT COUNT(*) FROM rate_limits
            WHERE user_id = userId
            AND endpoint = endpoint
            AND created_at > windowStart
    IF count >= 5:
        nextReset = earliest_request_in_window + 3600
        RETURN { allowed: false, retryAfter: nextReset - now() }
    ELSE:
        INSERT INTO rate_limits (user_id, endpoint, created_at)
        RETURN { allowed: true }
```

## Middleware Protection Logic

```typescript
// middleware.ts (Next.js)
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)
  const { data: { session } } = await supabase.auth.getSession()

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
    || request.nextUrl.pathname.startsWith('/upload')
    || request.nextUrl.pathname.startsWith('/analysis')
    || request.nextUrl.pathname.startsWith('/api/')

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return response
}
```
