/**
 * Quick Gemini model validation — checks exactly which model responds.
 * Run: node scripts/check-model.js
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL;

console.log('API_KEY present:', !!apiKey, '| prefix:', apiKey ? apiKey.slice(0,6)+'...' : 'N/A');
console.log('MODEL configured as:', modelName);

const { GoogleGenerativeAI } = await import('@google/generative-ai');
const genAI = new GoogleGenerativeAI(apiKey);

try {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent('In exactly 10 words: confirm you are an AI assistant for stadiums.');
  const text = result.response.text();
  const usageMetadata = result.response.usageMetadata;
  console.log('\n✅ SUCCESS');
  console.log('Response:', text.trim());
  console.log('Usage metadata:', JSON.stringify(usageMetadata));
  // Check the response candidates for model info
  const candidates = result.response.candidates;
  if (candidates && candidates[0]) {
    console.log('Finish reason:', candidates[0].finishReason);
  }
} catch (err) {
  console.error('\n❌ ERROR:', err.message);
  if (err.message && err.message.includes('not found')) {
    console.error(`Model "${modelName}" does not exist.`);
    console.error('Trying fallback: gemini-1.5-flash...');
    try {
      const m2 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const r2 = await m2.generateContent('Say: fallback model works');
      console.log('✅ Fallback gemini-1.5-flash works:', r2.response.text().trim());
    } catch (err2) {
      console.error('Fallback also failed:', err2.message);
    }
  }
}
