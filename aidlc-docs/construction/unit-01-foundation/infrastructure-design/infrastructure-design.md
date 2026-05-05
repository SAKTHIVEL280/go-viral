# Infrastructure Design — UNIT-01: Foundation

## Deployment Architecture

```
[Vercel CDN / Edge Network]
    |
    +-- Static Assets (Landing, Auth pages) → Vercel Edge Cache
    |
    +-- Next.js Serverless Functions (API Routes)
    |       POST /api/upload
    |       (other routes in UNIT-02)
    |
    v
[Supabase (hosted PostgreSQL + Storage + Auth)]
    |
    +-- auth.users table (managed by Supabase Auth)
    +-- analyses table (UNIT-02)
    +-- rate_limits table
    +-- media-uploads bucket (private, RLS)
```

## Environment Variables

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Server-side only, never exposed to client
NEXT_PUBLIC_APP_URL=https://[your-app].vercel.app
```

## Supabase Configuration

### Storage Bucket: `media-uploads`
- Visibility: Private
- Max file size: 200MB (configured in Supabase dashboard)
- Allowed MIME types: `video/mp4, video/quicktime, video/webm, image/jpeg, image/png, image/gif, image/webp`
- RLS: Users can only upload/read their own files
  ```sql
  CREATE POLICY "Users upload own files"
    ON storage.objects FOR INSERT
    WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

  CREATE POLICY "Users read own files"
    ON storage.objects FOR SELECT
    USING (auth.uid()::text = (storage.foldername(name))[1]);
  ```

### Auth Configuration (Supabase Dashboard)
- Email auth: enabled
- Google OAuth: enabled (requires Google Cloud Console OAuth app)
- Redirect URLs: `https://[app].vercel.app/auth/callback`
- JWT expiry: 3600s (1 hour)
- Refresh token rotation: enabled

## Vercel Configuration

### `next.config.ts`
```typescript
const nextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; ..." },
      ]
    }]
  }
}
```

### Vercel Environment Variables (set in dashboard)
- `NEXT_PUBLIC_SUPABASE_URL` — public
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public
- `SUPABASE_SERVICE_ROLE_KEY` — secret (server-only)
- `NEXT_PUBLIC_APP_URL` — public
