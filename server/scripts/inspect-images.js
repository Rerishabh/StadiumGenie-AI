import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stadiumgenie');

const Event = mongoose.models.Event || (await import('../models/event.model.js')).default;
const Stadium = mongoose.models.Stadium || (await import('../models/stadium.model.js')).default;

console.log('=== EVENTS (bannerImage field) ===');
const events = await Event.find({ isActive: true }).select('title sport bannerImage description').lean();
events.forEach(e => {
  console.log(JSON.stringify({
    title: e.title,
    sport: e.sport,
    bannerImage: e.bannerImage,
    hasDesc: !!(e.description && e.description.length > 10)
  }));
});

console.log('\n=== STADIUMS (imageUrl + images fields) ===');
const stadiums = await Stadium.find({ isActive: true }).select('name imageUrl images sportsSupported').lean();
stadiums.forEach(s => {
  console.log(JSON.stringify({
    name: s.name,
    imageUrl: s.imageUrl || null,
    imagesCount: s.images?.length || 0,
    firstImageUrl: s.images?.[0]?.url || null,
    sports: s.sportsSupported
  }));
});

await mongoose.disconnect();
console.log('\nDone.');
