#!/usr/bin/env node

/**
 * List available Gemini models
 * Run: node scripts/list-gemini-models.js
 */

require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  console.log('📋 Listing Available Gemini Models...\n');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is missing');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // List all available models
    const models = await genAI.listModels();
    
    console.log(`✅ Found ${models.length} available models:\n`);
    
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    });

    // Find Flash models
    const flashModels = models.filter(m => 
      m.name.includes('flash') || m.displayName.toLowerCase().includes('flash')
    );

    if (flashModels.length > 0) {
      console.log('⚡ Flash Models Available:');
      flashModels.forEach(m => {
        console.log(`   - ${m.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

listModels();
