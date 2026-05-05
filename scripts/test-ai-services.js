#!/usr/bin/env node

/**
 * AI Services Test Script
 * Run: node scripts/test-ai-services.js
 */

require('dotenv').config({ path: '.env.local' });

async function testAIServices() {
  console.log('🤖 Testing AI Services...\n');

  // Test 1: Check Gemini API Key
  console.log('1️⃣ Testing Google Gemini API:');
  const geminiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiKey) {
    console.error('   ❌ GEMINI_API_KEY is missing');
    console.log('   📋 Get key from: https://aistudio.google.com/app/apikey');
  } else {
    console.log(`   ✅ GEMINI_API_KEY is set: ${geminiKey.substring(0, 20)}...`);
    
    // Test API call
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Say "Hello" in one word' }]
            }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Gemini API is working!');
        console.log(`   💬 Test response: ${data.candidates[0].content.parts[0].text.trim()}`);
      } else {
        const error = await response.text();
        console.error(`   ❌ Gemini API error (${response.status}): ${error.substring(0, 100)}`);
      }
    } catch (err) {
      console.error(`   ❌ Network error: ${err.message}`);
    }
  }

  // Test 2: Check Groq API Key
  console.log('\n2️⃣ Testing Groq API:');
  const groqKey = process.env.GROQ_API_KEY;
  
  if (!groqKey) {
    console.error('   ❌ GROQ_API_KEY is missing');
    console.log('   📋 Get key from: https://console.groq.com/keys');
  } else {
    console.log(`   ✅ GROQ_API_KEY is set: ${groqKey.substring(0, 20)}...`);
    
    // Test API call
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'Say "Hello" in one word' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Groq API is working!');
        console.log(`   💬 Test response: ${data.choices[0].message.content.trim()}`);
      } else {
        const error = await response.text();
        console.error(`   ❌ Groq API error (${response.status}): ${error.substring(0, 100)}`);
      }
    } catch (err) {
      console.error(`   ❌ Network error: ${err.message}`);
    }
  }

  console.log('\n✅ AI services check complete!');
}

testAIServices();
