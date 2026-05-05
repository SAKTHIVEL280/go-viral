# Domain Entities — UNIT-01: Foundation

## User (managed by Supabase Auth)
```typescript
interface User {
  id: string           // UUID from auth.users
  email: string
  name: string | null
  avatarUrl: string | null
  createdAt: string
}
```

## Session
```typescript
interface Session {
  accessToken: string   // JWT — validated server-side on every request
  refreshToken: string
  user: User
  expiresAt: number     // Unix timestamp
}
```

## UploadedFile
```typescript
interface UploadedFile {
  storagePath: string   // {userId}/{timestamp}-{filename}
  signedUrl: string     // Time-limited (1 hour) for AI processing
  mimeType: string
  sizeBytes: number
  mediaType: MediaType  // 'video' | 'image' | 'caption'
}
```

## RateLimitRecord (in-memory / Supabase)
```typescript
interface RateLimitRecord {
  userId: string
  endpoint: string
  requestCount: number
  windowStart: number   // Unix timestamp
}
```

## Validation Rules
- File type allowlist: `['video/mp4', 'video/mov', 'video/webm', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']`
- Max video size: 200MB (209,715,200 bytes)
- Max image size: 10MB (10,485,760 bytes)
- Max caption length: 2,200 characters
- Rate limit: 5 analyses per user per hour
