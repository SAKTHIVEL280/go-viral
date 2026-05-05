-- ============================================================================
-- Fix Storage Policies for Existing media-uploads Bucket
-- ============================================================================
-- Run this in Supabase SQL Editor if bucket already exists
-- ============================================================================

-- First, drop any existing policies (in case they exist but are misconfigured)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read" ON storage.objects;

-- Policy 1: Allow authenticated users to upload to their own folder
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media-uploads' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow authenticated users to read their own files
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media-uploads' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy 3: Allow service role full access (for backend operations)
CREATE POLICY "Allow service role full access"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'media-uploads')
WITH CHECK (bucket_id = 'media-uploads');

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%media-uploads%' 
  OR policyname LIKE '%authenticated%'
  OR policyname LIKE '%service%';
