#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * Run: node scripts/test-supabase-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const BUCKET_NAME = 'media-uploads';

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Check environment variables
  console.log('1️⃣ Checking Environment Variables:');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.error('   ❌ NEXT_PUBLIC_SUPABASE_URL is missing');
    return;
  }
  console.log(`   ✅ NEXT_PUBLIC_SUPABASE_URL: ${url}`);

  if (!anonKey) {
    console.error('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
    return;
  }
  console.log(`   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey.substring(0, 20)}...`);

  if (!serviceKey) {
    console.error('   ❌ SUPABASE_SERVICE_ROLE_KEY is missing');
    return;
  }
  console.log(`   ✅ SUPABASE_SERVICE_ROLE_KEY: ${serviceKey.substring(0, 20)}...`);

  // Test connection with service role
  console.log('\n2️⃣ Testing Connection with Service Role:');
  const supabase = createClient(url, serviceKey);

  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error(`   ❌ Failed to connect: ${error.message}`);
      return;
    }

    console.log('   ✅ Connected successfully!');
    console.log(`   📦 Found ${data.length} bucket(s):`);
    data.forEach(bucket => {
      console.log(`      - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    // Check if media-uploads bucket exists
    console.log(`\n3️⃣ Checking for '${BUCKET_NAME}' bucket:`);
    const mediaUploadsBucket = data.find(b => b.name === BUCKET_NAME);
    
    if (!mediaUploadsBucket) {
      console.error(`   ❌ Bucket '${BUCKET_NAME}' NOT FOUND`);
      console.log('\n📋 SOLUTION:');
      console.log('   1. Go to: https://supabase.com/dashboard');
      console.log('   2. Select your project');
      console.log('   3. Navigate to: Storage');
      console.log('   4. Click: "New bucket"');
      console.log(`   5. Name: ${BUCKET_NAME}`);
      console.log('   6. Public: NO (leave unchecked)');
      console.log('   7. File size limit: 200 MB');
      console.log('   8. Click: "Create bucket"');
      console.log('\n   OR run the SQL from SUPABASE-STORAGE-SETUP.md');
      return;
    }

    console.log(`   ✅ Bucket '${BUCKET_NAME}' exists!`);
    console.log(`      - Public: ${mediaUploadsBucket.public ? 'Yes' : 'No'}`);
    console.log(`      - File size limit: ${mediaUploadsBucket.file_size_limit ? (mediaUploadsBucket.file_size_limit / 1024 / 1024).toFixed(0) + ' MB' : 'Not set'}`);

    // Test bucket access
    console.log(`\n4️⃣ Testing Bucket Access:`);
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 });

    if (listError) {
      console.error(`   ❌ Cannot access bucket: ${listError.message}`);
      console.log('\n📋 SOLUTION:');
      console.log('   Check RLS policies in SUPABASE-STORAGE-SETUP.md');
      return;
    }

    console.log('   ✅ Bucket is accessible!');
    console.log(`   📁 Files in bucket: ${files.length === 0 ? 'Empty (no files yet)' : files.length}`);

    // Test upload (small test file with supported MIME type)
    console.log(`\n5️⃣ Testing Upload:`);
    const testFileName = `test-${Date.now()}.jpg`;
    // Create a minimal valid JPEG (1x1 pixel red image)
    const testContent = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x03, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
      0x7F, 0x80, 0xFF, 0xD9
    ]);
    
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`test/${testFileName}`, testContent, {
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      console.error(`   ❌ Upload failed: ${uploadError.message}`);
      console.log('\n📋 SOLUTION:');
      console.log('   Check RLS policies - service role should have full access');
      return;
    }

    console.log('   ✅ Upload successful!');

    // Test signed URL generation
    console.log(`\n6️⃣ Testing Signed URL Generation:`);
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(`test/${testFileName}`, 60);

    if (signedUrlError) {
      console.error(`   ❌ Signed URL generation failed: ${signedUrlError.message}`);
      return;
    }

    console.log('   ✅ Signed URL generated successfully!');
    console.log(`   🔗 URL: ${signedUrlData.signedUrl.substring(0, 60)}...`);

    // Cleanup test file
    console.log(`\n7️⃣ Cleaning up test file:`);
    await supabase.storage.from(BUCKET_NAME).remove([`test/${testFileName}`]);
    console.log('   ✅ Test file removed');

    console.log('\n✅ ALL TESTS PASSED! Your Supabase storage is configured correctly.');
    console.log('\n🚀 You can now use the upload feature in your app!');

  } catch (error) {
    console.error(`\n❌ Unexpected error: ${error.message}`);
    console.error(error);
  }
}

testConnection();
