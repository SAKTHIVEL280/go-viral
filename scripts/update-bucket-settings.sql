-- ============================================================================
-- Update media-uploads Bucket Settings
-- ============================================================================
-- Run this to ensure bucket has correct file size limit and MIME types
-- ============================================================================

-- Update bucket settings
UPDATE storage.buckets
SET 
  public = false,
  file_size_limit = 209715200, -- 200 MB in bytes
  allowed_mime_types = ARRAY[
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
WHERE id = 'media-uploads';

-- Verify bucket settings
SELECT 
  id,
  name,
  public,
  file_size_limit,
  file_size_limit / 1024 / 1024 as size_limit_mb,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'media-uploads';
