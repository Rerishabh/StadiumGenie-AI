import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';
import Event from '../models/event.model.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const users = await User.find().lean().exec();
  console.log('Users found:', users.map(u => ({ id: u._id, name: u.name, email: u.email })));

  const bookings = await Booking.find().populate('eventId').lean().exec();
  console.log('Bookings in database:', bookings.length);
  bookings.forEach(b => {
    console.log(`Booking ID: ${b._id}, Number: ${b.bookingNumber}, User: ${b.userId}, Event: ${b.eventId?.title}, Date: ${b.eventId?.startDateTime}, Status: ${b.bookingStatus}, Payment: ${b.paymentStatus}`);
  });

  await mongoose.connection.close();
}

check().catch(console.error);
