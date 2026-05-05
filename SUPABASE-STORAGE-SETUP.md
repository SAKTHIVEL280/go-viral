# 🗄️ Supabase Storage Setup Guide

## ❌ Current Error
```
500 Internal Server Error on /api/upload
```

**Cause**: The storage bucket `media-uploads` doesn't exist in your Supabase project.

---

## ✅ SOLUTION: Create Storage Bucket

### **Step 1: Go to Supabase Dashboard**

1. Open: https://supabase.com/dashboard
2. Select your project: **prfqudhdpfjqknxvbtvv**
3. Navigate to: **Storage** (in left sidebar)

---

### **Step 2: Create New Bucket**

Click **"New bucket"** button and configure:

#### **Bucket Name**
```
media-uploads
```
⚠️ **IMPORTANT**: Must be exactly `media-uploads` (lowercase, with hyphen)

#### **Public Bucket**
```
☐ Public bucket (LEAVE UNCHECKED)
```
**Reason**: We use signed URLs for security, not public access

#### **File Size Limit**
```
200 MB
```
(This matches your MAX_VIDEO_BYTES setting)

#### **Allowed MIME Types**
```
video/mp4
video/quicktime
video/webm
image/jpeg
image/png
image/gif
image/webp
```

---

### **Step 3: Configure Bucket Policies**

After creating the bucket, you need to set up Row Level Security (RLS) policies.

#### **Go to Policies Tab**

1. Click on your `media-uploads` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**

---

#### **Policy 1: Allow Authenticated Users to Upload**

**Policy Name**: `Allow authenticated uploads`

**Target Roles**: `authenticated`

**Policy Definition**: `INSERT`

**USING expression**:
```sql
(auth.uid() = (storage.foldername(name))[1]::uuid)
```

**WITH CHECK expression**:
```sql
(auth.uid() = (storage.foldername(name))[1]::uuid)
```

**What this does**: Users can only upload to their own folder (userId)

---

#### **Policy 2: Allow Authenticated Users to Read Their Files**

**Policy Name**: `Allow authenticated reads`

**Target Roles**: `authenticated`

**Policy Definition**: `SELECT`

**USING expression**:
```sql
(auth.uid() = (storage.foldername(name))[1]::uuid)
```

**What this does**: Users can only read files from their own folder

---

#### **Policy 3: Allow Service Role Full Access**

**Policy Name**: `Allow service role full access`

**Target Roles**: `service_role`

**Policy Definition**: `ALL`

**USING expression**:
```sql
true
```

**WITH CHECK expression**:
```sql
true
```

**What this does**: Your backend (using service role key) can access all files

---

### **Step 4: Verify Setup**

After creating the bucket and policies, verify:

✅ Bucket name is exactly: `media-uploads`  
✅ Bucket is **private** (not public)  
✅ File size limit: 200 MB  
✅ Three policies created (upload, read, service role)  
✅ Allowed MIME types configured

---

## 🧪 **Test the Upload**

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/auth

3. Sign in (create account if needed)

4. Go to: http://localhost:3000/upload

5. Select a platform (TikTok, Instagram, or YouTube Shorts)

6. Upload a test image or video

7. Should see upload progress and then analysis overlay

---

## 🔧 **Alternative: Quick Setup via SQL**

If you prefer SQL, you can run this in Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-uploads',
  'media-uploads',
  false,
  209715200, -- 200 MB in bytes
  ARRAY[
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
);

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

-- Policy 3: Allow service role full access
CREATE POLICY "Allow service role full access"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'media-uploads')
WITH CHECK (bucket_id = 'media-uploads');
```

---

## 🐛 **Troubleshooting**

### Error: "Bucket already exists"
**Solution**: The bucket was created but policies are missing. Go to Policies tab and add them.

### Error: "new row violates row-level security policy"
**Solution**: RLS policies are too restrictive. Check that policies match the SQL above.

### Error: "File too large"
**Solution**: Increase bucket file size limit to 200 MB (209715200 bytes).

### Error: "Invalid MIME type"
**Solution**: Add the MIME type to bucket's allowed types list.

### Upload works but can't view file
**Solution**: Check that signed URL generation is working. Verify service role key is correct.

---

## 📁 **Folder Structure in Bucket**

After users upload files, your bucket will look like:

```
media-uploads/
├── [user-id-1]/
│   ├── 1777890000000-video.mp4
│   ├── 1777890100000-image.jpg
│   └── 1777890200000-thumbnail.png
├── [user-id-2]/
│   ├── 1777890300000-reel.mp4
│   └── 1777890400000-story.jpg
└── [user-id-3]/
    └── 1777890500000-short.mp4
```

Each user has their own folder (their UUID), and files are prefixed with timestamp.

---

## 🔐 **Security Notes**

✅ **Private Bucket**: Files are not publicly accessible  
✅ **Signed URLs**: Temporary URLs expire after 1 hour  
✅ **User Isolation**: Users can only access their own files  
✅ **Service Role**: Backend can access all files for analysis  
✅ **File Validation**: MIME types and sizes are validated  

---

## 🚀 **Next Steps**

After setting up storage:

1. ✅ Create `media-uploads` bucket
2. ✅ Configure RLS policies
3. ✅ Test upload functionality
4. ✅ Verify signed URLs work
5. ✅ Test analysis flow end-to-end

---

## 📞 **Need Help?**

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs → Storage
2. Check browser console for detailed errors
3. Verify environment variables are correct
4. Ensure you're signed in when testing upload

---

**Setup Time**: ~5 minutes  
**Difficulty**: Easy  
**Required**: Yes (blocking for upload feature)
