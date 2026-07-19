/**
 * fix-duplicate-event-images.js
 * Gives each unique event title a distinct image.
 * Handles the duplicate event records (old seeds created duplicate titles).
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stadiumgenie');
const Event = (await import('../models/event.model.js')).default;

// Additional verified-working Unsplash photo IDs for variety
const EXTRA_FOOTBALL = 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1200&q=80';
const EXTRA_FOOTBALL2 = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80';
const EXTRA_CRICKET = 'https://images.unsplash.com/photo-1600679472829-3044539ce8ed?auto=format&fit=crop&w=1200&q=80';
const EXTRA_HOCKEY = 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=1200&q=80';
const EXTRA_CONCERT = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';

// Unique per-title image assignments (for the generic/test events that have duplicates)
// We sort by createdAt ascending, then assign different images to each occurrence
const perTitleImages = {
  'Championship Final': [
    { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', alt: 'Championship final football match' },
    { url: EXTRA_FOOTBALL, alt: 'Football championship at floodlit stadium' },
  ],
  'Friendly Match': [
    { url: EXTRA_CRICKET, alt: 'Cricket friendly international match' },
    { url: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=1200&q=80', alt: 'Cricket friendly match at stadium' },
  ],
  'Concert Night': [
    { url: EXTRA_CONCERT, alt: 'Stadium concert night with spectacular lights' },
    { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', alt: 'Live concert event at large venue' },
  ],
  'Local Cup': [
    { url: EXTRA_HOCKEY, alt: 'Local cup hockey match' },
    { url: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=1200&q=80', alt: 'Local cup sports competition' },
  ],
  // FIFA World Cup 2026 appears once but shares the football fallback with Championship Final
  'FIFA World Cup 2026 - Opening Match': [
    { url: EXTRA_FOOTBALL2, alt: 'FIFA World Cup opening match at MetLife Stadium' },
  ],
};

console.log('Fixing per-title duplicate event images...\n');

for (const [title, images] of Object.entries(perTitleImages)) {
  // Get all events with this title, sorted by creation date
  const docs = await Event.find({ title }).sort({ createdAt: 1 }).lean();
  console.log(`"${title}" → ${docs.length} record(s) found`);
  
  for (let i = 0; i < docs.length; i++) {
    const img = images[i % images.length];
    await Event.updateOne({ _id: docs[i]._id }, { $set: { bannerImage: img } });
    console.log(`  Updated [${i}]: ${img.url.substring(0, 70)}...`);
  }
}

console.log('\nDone.');
await mongoose.disconnect();
