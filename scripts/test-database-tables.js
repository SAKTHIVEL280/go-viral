#!/usr/bin/env node

/**
 * Database Tables Test Script
 * Run: node scripts/test-database-tables.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testDatabase() {
  console.log('🔍 Testing Database Tables...\n');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(url, serviceKey);

  // Test 1: Check rate_limits table
  console.log('1️⃣ Testing rate_limits table:');
  try {
    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
      if (error.message.includes('does not exist')) {
        console.log('\n📋 SOLUTION: Run the migration SQL in Supabase SQL Editor');
        console.log('   File: supabase/migrations/001_initial_schema.sql');
      }
    } else {
      console.log('   ✅ rate_limits table exists');
      console.log(`   📊 Records: ${data.length}`);
    }
  } catch (err) {
    console.error(`   ❌ Unexpected error: ${err.message}`);
  }

  // Test 2: Check analyses table
  console.log('\n2️⃣ Testing analyses table:');
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
      if (error.message.includes('does not exist')) {
        console.log('\n📋 SOLUTION: Run the migration SQL in Supabase SQL Editor');
        console.log('   File: supabase/migrations/001_initial_schema.sql');
      }
    } else {
      console.log('   ✅ analyses table exists');
      console.log(`   📊 Records: ${data.length}`);
    }
  } catch (err) {
    console.error(`   ❌ Unexpected error: ${err.message}`);
  }

  // Test 3: Check auth.users (should always exist)
  console.log('\n3️⃣ Testing auth.users table:');
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
    } else {
      console.log('   ✅ auth.users table exists');
      console.log(`   👥 Users: ${data.users.length}`);
    }
  } catch (err) {
    console.error(`   ❌ Unexpected error: ${err.message}`);
  }

  console.log('\n✅ Database check complete!');
}

testDatabase();
