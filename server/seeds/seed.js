import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Resolve to server/.env so it works from root or server dir
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import User from '../models/user.model.js';
import Stadium from '../models/stadium.model.js';
import Event from '../models/event.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import Ticket from '../models/ticket.model.js';
import { adminUser, stadiums, events } from './sampleData.js';

const ADMIN_PASSWORD = 'Password123!';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set; aborting seed');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding');

  const existingAdmin = await User.findOne({ email: adminUser.email }).exec();
  let adminId;

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  if (!existingAdmin) {
    const u = new User({
      name: adminUser.name,
      email: adminUser.email,
      password: ADMIN_PASSWORD,
      role: adminUser.role,
      isActive: true,
    });
    await u.save();
    adminId = u._id;
    console.log('Created admin user');
  } else {
    await User.updateOne(
      { email: adminUser.email },
      {
        $set: {
          name: adminUser.name,
          password: hashed,
          role: adminUser.role,
        },
      }
    );
    adminId = existingAdmin._id;
    console.log('Updated admin user');
  }

  // seed stadiums
  const stadiumIds = [];
  for (const s of stadiums) {
    let doc = await Stadium.findOne({ name: s.name }).exec();
    if (!doc) {
      doc = new Stadium({ ...s, isActive: true });
      await doc.save();
      console.log('Created stadium:', s.name);
    } else {
      // update fields to ensure fresh multi-sport data
      await Stadium.updateOne(
        { _id: doc._id },
        {
          $set: {
            city: s.city,
            state: s.state || '',
            country: s.country || '',
            address: s.address || '',
            description: s.description || '',
            capacity: s.capacity,
            imageUrl: s.imageUrl,
            sportsSupported: s.sportsSupported,
            facilities: s.facilities,
            amenities: s.amenities,
            latitude: s.latitude,
            longitude: s.longitude,
            rating: s.rating,
          },
        }
      );
      console.log('Updated stadium:', s.name);
    }
    stadiumIds.push(doc._id);
  }

  // seed events linked to stadiums
  const eventIds = [];
  for (let i = 0; i < events.length; i += 1) {
    const e = events[i];
    const stadiumId = stadiumIds[e.stadiumIndex % stadiumIds.length];
    let doc = await Event.findOne({ title: e.title, stadiumId }).exec();
    
    // Future date setup (spaced out over the next few weeks)
    const startDateTime = new Date();
    startDateTime.setDate(startDateTime.getDate() + (i + 2)); // 2, 3, 4... days in future
    startDateTime.setHours(18, 0, 0, 0); // 6:00 PM

    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(21, 0, 0, 0); // 9:00 PM

    if (!doc) {
      doc = new Event({
        title: e.title,
        description: e.description,
        sport: e.sport,
        organizer: e.organizer,
        stadiumId,
        startDateTime,
        endDateTime,
        totalSeats: e.totalSeats,
        availableSeats: e.totalSeats,
        price: e.price,
        bannerImage: e.bannerImage,
        status: 'scheduled',
        isActive: true,
      });
      await doc.save();
      console.log('Created event:', e.title);
    } else {
      await Event.updateOne(
        { _id: doc._id },
        {
          $set: {
            description: e.description,
            sport: e.sport,
            organizer: e.organizer,
            price: e.price,
            bannerImage: e.bannerImage,
            startDateTime,
            endDateTime,
          },
        }
      );
      console.log('Updated event:', e.title);
    }
    eventIds.push(doc._id);
  }

  // create sample booking/payment/ticket for first event if none exist at all
  const bookingExists = await Booking.findOne({ eventId: eventIds[0] }).exec();
  if (!bookingExists) {
    const booking = new Booking({
      userId: adminId,
      eventId: eventIds[0],
      bookingNumber: `BK-${Date.now()}`,
      quantity: 1,
      totalAmount: events[0].price,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      isActive: true,
    });
    await booking.save();
    console.log('Created sample booking');

    const payment = new Payment({
      bookingId: booking._id,
      userId: adminId,
      paymentReference: `PAY-${Date.now()}`,
      amount: booking.totalAmount,
      currency: 'INR',
      paymentMethod: 'cash',
      paymentStatus: 'success',
      transactionDate: new Date(),
    });
    await payment.save();
    console.log('Created sample payment');

    const ticket = new Ticket({
      bookingId: booking._id,
      paymentId: payment._id,
      eventId: booking.eventId,
      userId: booking.userId,
      stadiumId: stadiumIds[0],
      ticketNumber: `TKT-${Date.now()}`,
      qrCode: 'data:,seed',
      ticketStatus: 'active',
    });
    await ticket.save();
    console.log('Created sample ticket');
  } else {
    console.log('Sample booking/ticket already exists');
  }

  await mongoose.connection.close();
  console.log('Seeding complete successfully');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed error', e && e.message ? e.message : e);
  process.exit(1);
});