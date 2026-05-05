#!/usr/bin/env node

/**
 * Test Gemini API using the actual SDK (same as the app)
 * Run: node scripts/test-gemini-real.js
 */

require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🤖 Testing Gemini API with Real SDK...\n');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is missing in .env.local');
    return;
  }

  console.log(`✅ API Key found: ${apiKey.substring(0, 20)}...\n`);

  try {
    // Initialize the SDK (same as the app)
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try different model names
    const modelNames = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-1.5-pro-latest'
    ];

    let workingModel = null;
    let workingModelName = null;

    console.log('🔍 Testing available models...\n');

    for (const modelName of modelNames) {
      try {
        console.log(`   Testing: ${modelName}...`);
        const testModel = genAI.getGenerativeModel({ model: modelName });
        const result = await testModel.generateContent('Say "OK" in one word');
        const text = result.response.text();
        
        console.log(`   ✅ ${modelName} works! Response: ${text.trim()}`);
        workingModel = testModel;
        workingModelName = modelName;
        break;
      } catch (error) {
        console.log(`   ❌ ${modelName} failed: ${error.message.substring(0, 80)}...`);
      }
    }

    if (!workingModel) {
      console.error('\n❌ No working model found!');
      console.log('\n📋 SOLUTION:');
      console.log('   Your API key may be invalid or restricted.');
      console.log('   1. Go to: https://aistudio.google.com/app/apikey');
      console.log('   2. Create a new API key');
      console.log('   3. Update GEMINI_API_KEY in .env.local');
      return;
    }

    console.log(`\n✅ Using model: ${workingModelName}\n`);

    // Now use the working model for actual tests
    const model = genAI.getGenerativeModel({
      model: workingModelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    console.log('📡 Testing text generation...');
    
    // Test 1: Simple text generation
    const prompt = `Generate a JSON response with this structure:
{
  "status": "success",
  "message": "Hello from Gemini!",
  "timestamp": "${new Date().toISOString()}"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('✅ Gemini API Response:');
    console.log(text);
    
    // Parse JSON to verify it's valid
    try {
      const parsed = JSON.parse(text);
      console.log('\n✅ JSON parsing successful!');
      console.log('   Status:', parsed.status);
      console.log('   Message:', parsed.message);
    } catch (e) {
      console.log('\n⚠️ Response is not valid JSON, but API is working');
    }

    // Test 2: Simulate virality analysis prompt
    console.log('\n📊 Testing virality analysis prompt...');
    
    const viralityPrompt = `Analyze this caption for virality and return JSON:
Caption: "Just discovered the best coffee spot in town! ☕✨ #coffee #local"
Platform: instagram

Return JSON with this structure:
{
  "hookStrength": {
    "score": 75,
    "explanation": "Strong opening with discovery element"
  },
  "captionOptimization": {
    "score": 80,
    "explanation": "Good use of emojis and hashtags"
  }
}`;

    const viralityResult = await model.generateContent(viralityPrompt);
    const viralityText = viralityResult.response.text();
    
    console.log('✅ Virality Analysis Response:');
    console.log(viralityText.substring(0, 200) + '...');

    try {
      const parsed = JSON.parse(viralityText);
      console.log('\n✅ Virality analysis JSON is valid!');
      if (parsed.hookStrength) {
        console.log('   Hook Score:', parsed.hookStrength.score);
      }
      if (parsed.captionOptimization) {
        console.log('   Caption Score:', parsed.captionOptimization.score);
      }
    } catch (e) {
      console.log('\n⚠️ Could not parse virality JSON, but API responded');
    }

    console.log('\n✅ GEMINI API IS WORKING PERFECTLY!');
    console.log('🚀 Your app can now analyze content with AI!');

  } catch (error) {
    console.error('\n❌ Gemini API Error:');
    console.error('   Message:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n📋 SOLUTION:');
      console.log('   1. Go to: https://aistudio.google.com/app/apikey');
      console.log('   2. Create a new API key');
      console.log('   3. Update GEMINI_API_KEY in .env.local');
    } else if (error.message.includes('quota')) {
      console.log('\n📋 SOLUTION:');
      console.log('   You may have exceeded the free tier quota');
      console.log('   Wait a few minutes or check your quota at:');
      console.log('   https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas');
    } else {
      console.log('\n📋 Error details:', error);
    }
  }
}

testGemini();
