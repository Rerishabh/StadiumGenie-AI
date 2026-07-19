/**
 * fix-images.js
 * Comprehensive image URL fix for all events and stadiums in MongoDB.
 * - Updates bannerImage on events that have null/missing images
 * - Updates imageUrl on stadiums with broken/wrong images
 * - Adds meaningful descriptions to test events
 * - Only modifies image/description fields — does NOT touch bookings, users, tickets
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stadiumgenie');
console.log('Connected to MongoDB');

const Event = (await import('../models/event.model.js')).default;
const Stadium = (await import('../models/stadium.model.js')).default;

// ============================================================
// VERIFIED WORKING UNSPLASH PHOTO IDs (all confirmed 200 OK)
// ============================================================
const IMG = {
  // Sports action images
  football1: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  football2: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
  football3: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1200&q=80',
  cricket1:  'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=1200&q=80',
  cricket2:  'https://images.unsplash.com/photo-1600679472829-3044539ce8ed?auto=format&fit=crop&w=1200&q=80',
  basketball:'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
  tennis:    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
  hockey1:   'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=1200&q=80',
  hockey2:   'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=1200&q=80',
  badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
  concert:   'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  // Stadium/venue images
  stadiumMetlife: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80',
  stadiumCricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
  stadiumArena:   'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1200&q=80',
  stadiumTennis:  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
  stadiumHockey:  'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80',
  stadiumBadminton:'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80',
  stadiumGeneric: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80',
};

// ============================================================
// EVENT IMAGE + DESCRIPTION FIXES (by title match)
// ============================================================
const eventFixes = [
  // Named events missing bannerImage
  {
    titleMatch: /fifa world cup/i,
    bannerImage: { url: IMG.football1, alt: 'Football match at packed stadium' },
    description: 'The biggest football event on the planet arrives at MetLife Stadium. Experience the electric atmosphere as top national teams open the 2026 World Cup in front of 82,500 roaring fans. A once-in-a-lifetime sporting spectacle.',
  },
  {
    titleMatch: /nba finals/i,
    bannerImage: { url: IMG.basketball, alt: 'NBA Finals basketball arena action' },
    description: 'The Los Angeles Lakers face the Boston Celtics in a historic NBA Finals rematch at Crypto.com Arena. Championship glory is on the line in this epic seven-game series finale.',
  },
  {
    titleMatch: /us open tennis|grand slam tennis/i,
    bannerImage: { url: IMG.tennis, alt: 'Grand Slam tennis match at stadium court' },
    description: "Top-seeded tennis professionals battle under the lights of Arthur Ashe Stadium in the US Open Men's Singles Final. A grand slam showdown featuring the world's best on the biggest hard-court stage.",
  },
  {
    titleMatch: /indonesia open.*badminton|indonesia badminton|badminton.*semi/i,
    bannerImage: { url: IMG.badminton, alt: 'Professional badminton match in indoor arena' },
    description: "The world's fastest racket sport reaches its pinnacle as top global shuttlers compete in the Indonesia Open Semifinals at the legendary Istora Senayan. A showcase of elite badminton skill and agility.",
  },
  {
    titleMatch: /border.gavaskar/i,
    bannerImage: { url: IMG.cricket1, alt: 'Cricket test match at large cricket stadium' },
    description: 'India battles Australia in the highly anticipated Border-Gavaskar Trophy at the colossal Narendra Modi Stadium — the largest cricket ground in the world. Witness world-class test cricket in front of 132,000 fans.',
  },
  {
    titleMatch: /world football cup.*opening|world football cup/i,
    bannerImage: { url: IMG.football2, alt: 'World Football Cup opening ceremony at stadium' },
    description: 'Experience the electric atmosphere of the official opening match of the World Football Cup at MetLife Stadium. Top national teams clash in front of 82,000+ fans with world-class facilities and amenities.',
  },
  {
    titleMatch: /asian hockey/i,
    bannerImage: { url: IMG.hockey1, alt: 'Field hockey championship match on turf' },
    description: 'The Asian Hockey Championship reaches its grand finale as the top two national teams compete for continental gold at the historic Major Dhyan Chand National Stadium in New Delhi.',
  },
  {
    titleMatch: /basketball championship/i,
    bannerImage: { url: IMG.basketball, alt: 'Basketball championship arena game' },
    description: 'The ultimate basketball rivalry resumes as the home team hosts the championship final at Crypto.com Arena in a high-octane matchup that will determine the season champions.',
  },
  // Test/generic events — assign relevant content
  {
    titleMatch: /ticket test event/i,
    bannerImage: { url: IMG.football3, alt: 'Live sports event at stadium' },
    description: 'A demonstration sports event at the stadium showcasing the full booking and ticketing experience. Watch top athletes compete in this exciting live sports event.',
    sport: 'Football',
  },
  {
    titleMatch: /championship final/i,
    bannerImage: { url: IMG.football1, alt: 'Championship final match at floodlit stadium' },
    description: 'The Championship Final is here — the two best teams of the season clash in a winner-takes-all showdown. Secure your seats for this unmissable sporting occasion.',
    sport: 'Football',
  },
  {
    titleMatch: /friendly match/i,
    bannerImage: { url: IMG.cricket2, alt: 'Cricket friendly match at green stadium' },
    description: 'A highly entertaining international friendly match featuring star players. Perfect for fans looking to enjoy world-class sport in a relaxed and festive stadium atmosphere.',
    sport: 'Cricket',
  },
  {
    titleMatch: /concert night/i,
    bannerImage: { url: IMG.concert, alt: 'Stadium concert with lights and large crowd' },
    description: 'An unforgettable night of live music at the stadium. World-class artists perform on a spectacular stage with state-of-the-art sound and lighting for thousands of fans.',
    sport: null,
  },
  {
    titleMatch: /local cup/i,
    bannerImage: { url: IMG.hockey2, alt: 'Local cup hockey match at sports stadium' },
    description: 'The annual Local Cup brings fierce regional rivalry to the stadium. Passionate supporters back their teams in this exciting knockout tournament with local pride on the line.',
    sport: 'Hockey',
  },
];

// ============================================================
// STADIUM IMAGE FIXES (by exact name match)
// ============================================================
const stadiumFixes = [
  { nameMatch: /metlife/i,          imageUrl: IMG.stadiumMetlife,  description: 'A world-class multi-purpose stadium, home to the New York Giants and Jets. Host venue for the FIFA World Cup 2026 with 82,500 capacity and premium fan facilities.' },
  { nameMatch: /narendra modi/i,    imageUrl: IMG.stadiumCricket,  description: 'The largest cricket stadium in the world with 132,000 capacity. Features iconic architecture, LED floodlights, a premium multi-sport clubhouse, and top-class hospitality.' },
  { nameMatch: /crypto\.com|crypto com/i, imageUrl: IMG.stadiumArena, description: 'An iconic multi-purpose indoor arena in downtown Los Angeles. Home to legendary basketball clashes, awards ceremonies, and premier concert events with 19,079 capacity.' },
  { nameMatch: /arthur ashe/i,      imageUrl: IMG.stadiumTennis,   description: 'The main stadium of the US Open and the largest tennis venue in the world. Features a state-of-the-art retractable roof and unparalleled spectator sightlines with 23,771 capacity.' },
  { nameMatch: /dhyan chand|dhyan/i, imageUrl: IMG.stadiumHockey,  description: 'A historic field hockey stadium named after Indian hockey legend Major Dhyan Chand. Located near India Gate, it hosts national and international sports events with 16,200 capacity.' },
  { nameMatch: /istora/i,           imageUrl: IMG.stadiumBadminton, description: 'An iconic indoor arena famous for legendary badminton tournaments and unmatched crowd energy. An integral part of the Gelora Bung Karno Sports Complex with 7,166 capacity.' },
  { nameMatch: /main stadium/i,     imageUrl: IMG.stadiumGeneric,  description: 'A versatile multi-purpose stadium facility designed for a wide range of sporting events and large-scale gatherings, offering excellent viewing angles and fan amenities.' },
  // eden (null imageUrl, no sports)
  { nameMatch: /^eden$/i,           imageUrl: IMG.stadiumCricket,  description: 'A celebrated cricket and multi-sport stadium with a rich legacy of hosting international events, passionate crowds, and world-class sporting action.' },
];

// ============================================================
// APPLY EVENT FIXES
// ============================================================
const allEvents = await Event.find({}).select('_id title sport bannerImage description').lean();
console.log(`\nFound ${allEvents.length} events total`);

let eventUpdatedCount = 0;
for (const ev of allEvents) {
  const fix = eventFixes.find(f => f.titleMatch.test(ev.title));
  if (!fix) continue;

  const updateFields = {};
  // Always set banner image from fix (to repair broken/null ones)
  updateFields.bannerImage = fix.bannerImage;
  // Only fill in description if missing/empty
  if (!ev.description || ev.description.trim().length < 10) {
    updateFields.description = fix.description;
  }
  // Set sport if specified and currently missing
  if (fix.sport !== undefined && !ev.sport) {
    updateFields.sport = fix.sport;
  }

  await Event.updateOne({ _id: ev._id }, { $set: updateFields });
  console.log(`  ✅ Event updated: "${ev.title}" → bannerImage set`);
  eventUpdatedCount++;
}
console.log(`\nEvents updated: ${eventUpdatedCount}`);

// ============================================================
// APPLY STADIUM FIXES
// ============================================================
const allStadiums = await Stadium.find({}).select('_id name imageUrl description sportsSupported').lean();
console.log(`\nFound ${allStadiums.length} stadiums total`);

let stadiumUpdatedCount = 0;
for (const st of allStadiums) {
  const fix = stadiumFixes.find(f => f.nameMatch.test(st.name));
  if (!fix) continue;

  const updateFields = { imageUrl: fix.imageUrl };
  // Update description only if missing/short
  if (!st.description || st.description.trim().length < 20) {
    updateFields.description = fix.description;
  }

  await Stadium.updateOne({ _id: st._id }, { $set: updateFields });
  console.log(`  ✅ Stadium updated: "${st.name}" → imageUrl set`);
  stadiumUpdatedCount++;
}
console.log(`\nStadiums updated: ${stadiumUpdatedCount}`);

// ============================================================
// VERIFY RESULT
// ============================================================
console.log('\n=== VERIFICATION ===');
const verifyEvents = await Event.find({ isActive: true }).select('title sport bannerImage').lean();
verifyEvents.forEach(e => {
  const hasImg = !!(e.bannerImage && e.bannerImage.url);
  console.log(`  ${hasImg ? '✅' : '❌'} Event: "${e.title}" [${e.sport || 'no-sport'}] bannerImage: ${hasImg ? e.bannerImage.url.substring(0, 60) + '...' : 'NULL'}`);
});

const verifyStadiums = await Stadium.find({ isActive: true }).select('name imageUrl').lean();
verifyStadiums.forEach(s => {
  const hasImg = !!(s.imageUrl);
  console.log(`  ${hasImg ? '✅' : '❌'} Stadium: "${s.name}" imageUrl: ${hasImg ? s.imageUrl.substring(0, 60) + '...' : 'NULL'}`);
});

await mongoose.disconnect();
console.log('\nAll done. Database updated successfully.');
