/**
 * verify-images.js
 * Verifies all event bannerImage URLs and stadium imageUrl fields
 * by making actual HTTP HEAD requests to confirm they return 200.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import https from 'https';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stadiumgenie');

const Event = (await import('../models/event.model.js')).default;
const Stadium = (await import('../models/stadium.model.js')).default;

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url) return resolve({ status: 'NULL', ok: false });
    try {
      const req = https.get(url + '&w=100', (res) => {
        res.resume();
        resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
      });
      req.on('error', (e) => resolve({ status: 'ERR:' + e.message.substring(0, 40), ok: false }));
      req.setTimeout(8000, () => { req.destroy(); resolve({ status: 'TIMEOUT', ok: false }); });
    } catch (e) {
      resolve({ status: 'CATCH:' + e.message, ok: false });
    }
  });
}

console.log('\n=== EVENT IMAGE URL VERIFICATION ===\n');
const events = await Event.find({ isActive: true }).select('title sport bannerImage').lean();
let eventFail = 0;
const seen = {};

for (const e of events) {
  const url = e.bannerImage?.url;
  const result = await checkUrl(url);
  const isDup = url && seen[url];
  if (url) seen[url] = (seen[url] || 0) + 1;
  
  const mark = result.ok ? '✅' : '❌';
  const dupMark = isDup ? ' ⚠️ DUPLICATE' : '';
  console.log(`${mark} [${result.status}] "${e.title}" [${e.sport || 'no-sport'}]${dupMark}`);
  if (!result.ok) eventFail++;
}

console.log('\n=== STADIUM IMAGE URL VERIFICATION ===\n');
const stadiums = await Stadium.find({ isActive: true }).select('name imageUrl sportsSupported').lean();
let stadiumFail = 0;
const stadiumSeen = {};

for (const s of stadiums) {
  const url = s.imageUrl;
  const result = await checkUrl(url);
  const isDup = url && stadiumSeen[url];
  if (url) stadiumSeen[url] = (stadiumSeen[url] || 0) + 1;
  
  const mark = result.ok ? '✅' : '❌';
  const dupMark = isDup ? ' ⚠️ DUPLICATE' : '';
  console.log(`${mark} [${result.status}] "${s.name}" [${(s.sportsSupported||[]).join(',')}]${dupMark}`);
  if (!result.ok) stadiumFail++;
}

console.log('\n=== DUPLICATE IMAGE DETECTION ===');
Object.entries(seen).filter(([url, count]) => count > 1).forEach(([url, count]) => {
  console.log(`  ⚠️ Event image used ${count} times: ${url.substring(0, 80)}`);
});
Object.entries(stadiumSeen).filter(([url, count]) => count > 1).forEach(([url, count]) => {
  console.log(`  ⚠️ Stadium image used ${count} times: ${url.substring(0, 80)}`);
});

console.log(`\n=== SUMMARY ===`);
console.log(`Events: ${events.length} total, ${eventFail} failed, ${events.length - eventFail} OK`);
console.log(`Stadiums: ${stadiums.length} total, ${stadiumFail} failed, ${stadiums.length - stadiumFail} OK`);

await mongoose.disconnect();
