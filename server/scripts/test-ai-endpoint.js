/**
 * Full HTTP integration test for the StadiumGenie AI chat endpoint.
 *
 * Run from server/ directory:
 *   node scripts/test-ai-endpoint.js
 *
 * Steps:
 *  1. Start a test instance of the Express app (in-process, no child process)
 *  2. Generate a signed JWT using the configured JWT_SECRET (no real user needed)
 *  3. POST /api/v1/ai/chat with a stadium question
 *  4. Verify the response shape and that it's a live Gemini reply
 *  5. Test graceful error handling (empty message, missing auth)
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ── helpers ───────────────────────────────────────────────────────────────────
function makeRequest(server, method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const port = address.port;
    const opts = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── 1. Mint a test JWT (does not touch the DB) ─────────────────────────────
const jwt = await import('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('❌  JWT_SECRET is not set in server/.env');
  process.exit(1);
}

const testToken = jwt.default.sign(
  { sub: '000000000000000000000001', email: 'test@stadiumgenie.ai', role: 'user' },
  jwtSecret,
  { expiresIn: '5m' }
);

console.log('\n══════════════════════════════════════════════════════');
console.log('  StadiumGenie — HTTP AI Endpoint Integration Test');
console.log('══════════════════════════════════════════════════════\n');
console.log('✅  JWT_SECRET     : loaded');
console.log(`✅  GEMINI_MODEL   : ${process.env.GEMINI_MODEL}`);
console.log('✅  Test JWT minted (in-memory, no real user required)\n');

// ── 2. Start the Express app in-process ──────────────────────────────────────
// Import app WITHOUT triggering the real DB connection for the server startup.
// We still need Mongoose to at least not crash — we'll import the app which
// calls dotenv.config() internally, but we do NOT call connectDB() here.
// Instead we bind the HTTP server directly.
const { default: app } = await import('../app.js');

// Temporarily monkey-patch mongoose to avoid real connect in test context
// The AI endpoint itself does NOT require DB (stadiumId/eventId are null).
const server = http.createServer(app);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve)); // port 0 = random free port
const { port } = server.address();
console.log(`🚀  Test server started on port ${port}\n`);

let passed = 0;
let failed = 0;

// ── 3a. Health check ──────────────────────────────────────────────────────────
console.log('── Test 1: Health endpoint ──');
try {
  const r = await makeRequest(server, 'GET', '/health', null);
  if (r.status === 200 && r.body.status === 'ok') {
    console.log('✅  /health → 200 OK\n');
    passed++;
  } else {
    console.error('❌  /health unexpected response:', r);
    failed++;
  }
} catch (e) {
  console.error('❌  /health error:', e.message);
  failed++;
}

// ── 3b. Unauthorized request ──────────────────────────────────────────────────
console.log('── Test 2: No auth token → 401 ──');
try {
  const r = await makeRequest(server, 'POST', '/api/v1/ai/chat', { message: 'Hello' });
  if (r.status === 401) {
    console.log('✅  No auth → 401 Unauthorized (graceful)\n');
    passed++;
  } else {
    console.error(`❌  Expected 401, got ${r.status}:`, r.body);
    failed++;
  }
} catch (e) {
  console.error('❌  Error:', e.message);
  failed++;
}

// ── 3c. Empty message → 422 ──────────────────────────────────────────────────
console.log('── Test 3: Empty message → 422 ──');
try {
  const r = await makeRequest(server, 'POST', '/api/v1/ai/chat', { message: '   ' }, {
    Authorization: `Bearer ${testToken}`,
  });
  if (r.status === 422) {
    console.log('✅  Empty message → 422 Unprocessable Entity (graceful)\n');
    passed++;
  } else {
    console.error(`❌  Expected 422, got ${r.status}:`, r.body);
    failed++;
  }
} catch (e) {
  console.error('❌  Error:', e.message);
  failed++;
}

// ── 3d. Live Gemini chat ──────────────────────────────────────────────────────
const testQuestion = 'What are the bag size restrictions at FIFA World Cup 2026 stadiums?';
console.log('── Test 4: Live Gemini chat ──');
console.log(`📤  Question: "${testQuestion}"`);
console.log('⏳  Contacting Gemini API via /api/v1/ai/chat ...\n');

const t0 = Date.now();
try {
  const r = await makeRequest(
    server,
    'POST',
    '/api/v1/ai/chat',
    { message: testQuestion },
    { Authorization: `Bearer ${testToken}` },
  );
  const elapsed = Date.now() - t0;

  console.log(`HTTP Status  : ${r.status}`);
  console.log(`Response time: ${elapsed} ms`);

  if (r.status === 200 && r.body.success && r.body.data && r.body.data.reply) {
    const { reply, contextUsed, configError } = r.body.data;
    const isLive = reply.length > 30 && !configError && !reply.includes('AI assistant is not configured');

    console.log('\n══════════════════════════════════════════════════════');
    console.log('  GEMINI RESPONSE (via HTTP endpoint)');
    console.log('══════════════════════════════════════════════════════');
    console.log(reply.trim());
    console.log('\n══════════════════════════════════════════════════════');
    console.log(`  Model used   : ${process.env.GEMINI_MODEL}`);
    console.log(`  contextUsed  : ${contextUsed}`);
    console.log(`  configError  : ${configError}`);
    console.log(`  Live response: ${isLive ? '✅  YES' : '❌  NO — fallback'}`);
    console.log('══════════════════════════════════════════════════════\n');

    if (isLive) {
      console.log('✅  Live Gemini API response confirmed via HTTP endpoint\n');
      passed++;
    } else {
      console.error('❌  Response is a fallback, not a live Gemini reply\n');
      failed++;
    }
  } else {
    console.error(`❌  Unexpected response (status ${r.status}):`, JSON.stringify(r.body, null, 2));
    failed++;
  }
} catch (e) {
  console.error('❌  Error during AI chat request:', e.message);
  failed++;
}

// ── Summary ───────────────────────────────────────────────────────────────────
server.close();
console.log('══════════════════════════════════════════════════════');
console.log(`  TEST SUMMARY: ${passed} passed, ${failed} failed`);
console.log('══════════════════════════════════════════════════════\n');
process.exit(failed > 0 ? 1 : 0);
