/**
 * Live Gemini API verification script for StadiumGenie.
 *
 * Run from the server/ directory:
 *   node scripts/test-gemini-live.js
 *
 * This script:
 *  1. Loads .env and confirms GEMINI_API_KEY & GEMINI_MODEL are present
 *     WITHOUT printing the key value.
 *  2. Directly initialises the @google/generative-ai client and sends a
 *     realistic stadium-related question to Gemini.
 *  3. Prints the model name, question, and full AI response.
 *  4. Confirms the response is live (not a hardcoded fallback).
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ── 1. Env check ──────────────────────────────────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

console.log('\n══════════════════════════════════════════════════════');
console.log('  StadiumGenie — Live Gemini API Verification');
console.log('══════════════════════════════════════════════════════\n');

if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
  console.error('❌  GEMINI_API_KEY is not set or is still a placeholder in server/.env');
  process.exit(1);
}

// Confirm key is loaded without printing its value
console.log(`✅  GEMINI_API_KEY : loaded (${apiKey.length} chars, starts with "${apiKey.slice(0, 4)}...")`);
console.log(`✅  GEMINI_MODEL   : ${modelName}`);

// ── 2. Initialise Gemini client ───────────────────────────────────────────────
let GoogleGenerativeAI;
try {
  ({ GoogleGenerativeAI } = await import('@google/generative-ai'));
} catch (e) {
  console.error('\n❌  Failed to import @google/generative-ai:', e.message);
  console.error('    Run: cd server && npm install');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey.trim());

// ── 3. Build system prompt (same as ai.service.js — no context) ──────────────
const systemInstruction = `You are StadiumGenie AI, the official AI assistant for StadiumGenie — a smart stadium platform built for FIFA World Cup 2026. Your purpose is to help fans, organizers, volunteers, and venue staff navigate and operate stadiums efficiently and safely.

Your areas of expertise include:
- Stadium navigation (gates, sections, concourses, exits, parking, drop-off zones)
- Accessibility services (wheelchair access, hearing loops, visual assistance, companion facilities)
- Transportation guidance (public transit, ride-shares, parking, shuttle services)
- Stadium facilities (restrooms, food courts, medical centers, lost & found, VIP areas, fan zones)
- Stadium rules and regulations (prohibited items, entry procedures, bag policy, ticket scanning)
- Event-specific information (match schedule, ticket availability, seat categories, organizer info)
- Emergency and safety procedures

No specific stadium or event context is available for this session. Provide general FIFA World Cup 2026 stadium and fan guidance.`;

// ── 4. Send test question ──────────────────────────────────────────────────────
const testQuestion = 'What items are typically prohibited inside FIFA World Cup 2026 stadiums, and what are the bag size restrictions for entry?';

console.log(`\n📤  Test Question:\n    "${testQuestion}"\n`);
console.log('⏳  Contacting Gemini API...\n');

const startTime = Date.now();

try {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });

  const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 512,
      temperature: 0.4,
      topP: 0.85,
    },
  });

  const result = await chat.sendMessage(testQuestion);
  const elapsed = Date.now() - startTime;
  const reply = result.response.text();

  // Sanity check: reply must be non-empty and not a hardcoded fallback
  const FALLBACK_SNIPPET = "AI assistant is not configured";
  const isLive = reply && reply.trim().length > 20 && !reply.includes(FALLBACK_SNIPPET);

  console.log('══════════════════════════════════════════════════════');
  console.log('  GEMINI RESPONSE');
  console.log('══════════════════════════════════════════════════════');
  console.log(reply.trim());
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Response time : ${elapsed} ms`);
  console.log(`  Model used    : ${modelName}`);
  console.log(`  Live response : ${isLive ? '✅  YES — Gemini API is working correctly' : '❌  NO — response looks like a fallback'}`);
  console.log('══════════════════════════════════════════════════════\n');

  if (isLive) {
    console.log('🎉  SUCCESS: Live Gemini API connection verified!\n');
    process.exit(0);
  } else {
    console.error('⚠️   The response did not look like a live Gemini reply. Check the model name and API key.\n');
    process.exit(1);
  }

} catch (err) {
  const elapsed = Date.now() - startTime;
  console.error(`\n❌  Gemini API call failed after ${elapsed} ms`);
  console.error(`    Error: ${err.message || err}`);

  // Attempt to identify common failure modes
  if (err.message && err.message.includes('not found')) {
    console.error(`\n    ⚠️  Model "${modelName}" was NOT found. Try changing GEMINI_MODEL in server/.env`);
    console.error('       Supported models (legacy SDK): gemini-1.5-flash, gemini-1.5-pro');
  } else if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key'))) {
    console.error('\n    ⚠️  The API key appears to be invalid or expired. Verify GEMINI_API_KEY in server/.env');
  } else if (err.message && err.message.includes('quota')) {
    console.error('\n    ⚠️  Quota exceeded. Check your Gemini API quota at https://aistudio.google.com');
  }

  process.exit(1);
}
