-- ============================================================
-- Go Viral Clone — Initial Schema
-- ============================================================

-- ─── Rate Limits ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_limits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limits_user_endpoint_time
  ON rate_limits(user_id, endpoint, created_at DESC);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own rate limits"
  ON rate_limits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Analyses ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url   TEXT,
  media_type  TEXT NOT NULL CHECK (media_type IN ('video', 'image', 'caption')),
  platform    TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube_shorts')),
  caption     TEXT,
  scores      JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analyses_user_created
  ON analyses(user_id, created_at DESC);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their analyses"
  ON analyses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Storage Bucket Policies (run in Supabase dashboard) ──────
-- Bucket name: media-uploads (private)
-- Policy: Users can upload to their own folder
-- INSERT: (storage.foldername(name))[1] = auth.uid()::text
-- SELECT: (storage.foldername(name))[1] = auth.uid()::text
-- DELETE: (storage.foldername(name))[1] = auth.uid()::text
