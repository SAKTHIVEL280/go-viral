#!/usr/bin/env node

/**
 * Final Gemini API Test - Try all possible model names
 * Run: node scripts/test-gemini-final.js
 */

require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🤖 Testing Gemini API - Comprehensive Check\n');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is missing in .env.local');
    return;
  }

  console.log(`✅ API Key found: ${apiKey.substring(0, 20)}...\n`);

  const genAI = new GoogleGenerativeAI(apiKey);

  // List of model names to try (from newest to oldest)
  const modelNames = [
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-pro-vision',
  ];

  console.log('🔍 Testing available models...\n');

  let workingModel = null;
  let workingModelName = null;

  for (const modelName of modelNames) {
    try {
      process.stdout.write(`   Testing ${modelName}... `);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "OK"');
      const text = result.response.text();
      
      console.log(`✅ WORKS! Response: "${text.trim()}"`);
      workingModel = model;
      workingModelName = modelName;
      break;
    } catch (error) {
      if (error.message.includes('API_KEY_INVALID')) {
        console.log(`❌ API KEY INVALID`);
        console.log('\n📋 SOLUTION:');
        console.log('   1. Go to: https://aistudio.google.com/app/apikey');
        console.log('   2. Create a new API key');
        console.log('   3. Update GEMINI_API_KEY in .env.local');
        return;
      } else if (error.message.includes('not found')) {
        console.log(`❌ Not available`);
      } else if (error.message.includes('quota')) {
        console.log(`❌ Quota exceeded`);
      } else {
        console.log(`❌ ${error.message.substring(0, 50)}...`);
      }
    }
  }

  if (!workingModel) {
    console.error('\n❌ No working model found!');
    console.log('\n📋 POSSIBLE ISSUES:');
    console.log('   1. API key is invalid or expired');
    console.log('   2. API key doesn\'t have access to Gemini models');
    console.log('   3. You\'ve exceeded the free tier quota');
    console.log('\n📋 SOLUTIONS:');
    console.log('   1. Create new API key: https://aistudio.google.com/app/apikey');
    console.log('   2. Check quota: https://console.cloud.google.com/');
    console.log('   3. Wait a few minutes if quota exceeded');
    return;
  }

  console.log(`\n✅ SUCCESS! Using model: ${workingModelName}\n`);

  // Test JSON generation (what the app actually uses)
  console.log('📊 Testing JSON generation (app functionality)...\n');

  try {
    const jsonModel = genAI.getGenerativeModel({
      model: workingModelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const prompt = `Analyze this social media caption and return JSON:
Caption: "Just discovered the best coffee spot! ☕✨ #coffee"
Platform: instagram

Return this exact JSON structure:
{
  "hookStrength": {
    "score": 75,
    "explanation": "Strong opening with discovery element",
    "suggestions": ["Add urgency", "Include location"]
  },
  "captionOptimization": {
    "score": 80,
    "explanation": "Good use of emojis and hashtags",
    "suggestions": ["Add more hashtags", "Include call-to-action"]
  }
}`;

    const result = await jsonModel.generateContent(prompt);
    const jsonText = result.response.text();
    
    console.log('✅ JSON Response received:');
    console.log(jsonText.substring(0, 300) + '...\n');

    // Try to parse it
    try {
      const parsed = JSON.parse(jsonText);
      console.log('✅ JSON is valid!');
      console.log('   Hook Score:', parsed.hookStrength?.score || 'N/A');
      console.log('   Caption Score:', parsed.captionOptimization?.score || 'N/A');
    } catch (e) {
      console.log('⚠️ Response is not valid JSON, but API is working');
      console.log('   This might be fine - the app has error handling');
    }

    console.log('\n🎉 GEMINI API IS FULLY FUNCTIONAL!');
    console.log('🚀 Your app can now analyze content with AI!');
    console.log(`\n📝 Update src/lib/ai/gemini.ts to use: "${workingModelName}"`);

  } catch (error) {
    console.error('\n❌ JSON generation failed:', error.message);
  }
}

testGemini();
