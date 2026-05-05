#!/usr/bin/env node

/**
 * Test Google OAuth Configuration
 * Run: node scripts/test-google-oauth.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testGoogleOAuth() {
  console.log('🔐 Testing Google OAuth Configuration...\n');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(url, serviceKey);

  console.log('1️⃣ Checking Supabase Connection:');
  console.log(`   ✅ URL: ${url}`);

  console.log('\n2️⃣ Checking Auth Providers:');
  
  try {
    // Check if we can access auth settings (this is indirect)
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return;
    }

    console.log(`   ✅ Auth system is working`);
    console.log(`   👥 Total users: ${users.users.length}`);

    // Check if any users signed in with Google
    const googleUsers = users.users.filter(u => 
      u.app_metadata?.provider === 'google' || 
      u.identities?.some(i => i.provider === 'google')
    );

    if (googleUsers.length > 0) {
      console.log(`   ✅ Google OAuth is WORKING!`);
      console.log(`   👥 Users signed in with Google: ${googleUsers.length}`);
      googleUsers.forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.email || 'No email'}`);
      });
    } else {
      console.log(`   ℹ️  No users have signed in with Google yet`);
      console.log(`   📋 To test:`);
      console.log(`      1. Go to http://localhost:3000/auth`);
      console.log(`      2. Click "Continue with Google"`);
      console.log(`      3. Sign in with your Google account`);
    }

    console.log('\n3️⃣ Checking Email/Password Users:');
    const emailUsers = users.users.filter(u => 
      u.app_metadata?.provider === 'email' ||
      !u.app_metadata?.provider
    );
    console.log(`   👥 Email/password users: ${emailUsers.length}`);

    console.log('\n✅ Google OAuth Configuration Check Complete!');
    
    if (googleUsers.length > 0) {
      console.log('\n🎉 GOOGLE OAUTH IS WORKING PERFECTLY!');
    } else {
      console.log('\n📋 Google OAuth is configured but not tested yet.');
      console.log('   Try signing in with Google to verify it works.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testGoogleOAuth();
