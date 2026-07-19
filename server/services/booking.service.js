import mongoose from 'mongoose';
import Booking from '../models/booking.model.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';

function formatDateYYYYMMDD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function generateBookingNumber() {
  const datePart = formatDateYYYYMMDD(new Date());
  const prefix = `BK-${datePart}-`;
  // find max suffix used today and increment
  const doc = await Booking.findOne({ bookingNumber: { $regex: `^${prefix}` } })
    .sort({ bookingNumber: -1 })
    .lean()
    .exec();
  if (!doc || !doc.bookingNumber) {
    return `${prefix}0001`;
  }
  const parts = doc.bookingNumber.split('-');
  const last = parts[2] || '0000';
  const next = String(parseInt(last, 10) + 1).padStart(4, '0');
  return `${prefix}${next}`;
}

function toDTO(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    bookingNumber: doc.bookingNumber,
    userId: doc.userId,
    eventId: doc.eventId,
    quantity: doc.quantity,
    totalAmount: doc.totalAmount,
    bookingStatus: doc.bookingStatus,
    paymentStatus: doc.paymentStatus,
    bookedAt: doc.bookedAt || doc.createdAt,
    isActive: doc.isActive,
  };
}

export async function createBooking({ userId, eventId, quantity }) {
  // validate user
  const user = await User.findOne({ _id: userId }).lean().exec();
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 400;
    throw err;
  }

  // atomically decrement seats: ensure event exists, active, scheduled and has enough seats
  const event = await Event.findOneAndUpdate(
    { _id: eventId, isActive: true, status: 'scheduled', availableSeats: { $gte: quantity } },
    { $inc: { availableSeats: -quantity } },
    { new: true }
  ).exec();

  if (!event) {
    const err = new Error('Event not available or insufficient seats');
    err.statusCode = 400;
    throw err;
  }

  // compute totalAmount
  const totalAmount = (typeof event.price === 'number' ? event.price : 0) * quantity;

  // generate booking number (retry on duplicate)
  let bookingNumber;
  for (let i = 0; i < 5; i += 1) {
    bookingNumber = await generateBookingNumber();
    // check uniqueness
    // eslint-disable-next-line no-await-in-loop
    const exists = await Booking.findOne({ bookingNumber }).lean().exec();
    if (!exists) break;
    bookingNumber = null;
  }
  if (!bookingNumber) {
    // fallback: use timestamp
    bookingNumber = `BK-${Date.now()}`;
  }

  const bk = new Booking({
    userId,
    eventId,
    bookingNumber,
    quantity,
    totalAmount,
  });

  try {
    const saved = await bk.save();
    return toDTO(saved);
  } catch (e) {
    // restore seats if booking save failed
    await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: quantity } }).exec();
    throw e;
  }
}

export async function getAllBookings({ userId, page = 1, limit = 20 } = {}) {
  const q = { userId, isActive: true };
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const docs = await Booking.find(q)
    .sort({ bookedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate({
      path: 'eventId',
      select: 'title sport stadiumId startDateTime price',
      populate: { path: 'stadiumId', select: 'name city' }
    })
    .lean()
    .exec();
  const total = await Booking.countDocuments(q).exec();
  return {
    data: docs.map((d) => {
      const ev = d.eventId || null;
      return {
        id: d._id.toString(),
        bookingNumber: d.bookingNumber,
        quantity: d.quantity,
        totalAmount: d.totalAmount,
        bookingStatus: d.bookingStatus,
        paymentStatus: d.paymentStatus,
        bookedAt: d.bookedAt || d.createdAt,
        isActive: d.isActive,
        event: ev ? {
          ...ev,
          stadium: ev.stadiumId || null,
        } : null,
      };
    }),
    meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
  };
}

export async function getBookingById({ userId, id }) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await Booking.findOne({ _id: id, userId, isActive: true })
    .populate('eventId', 'title sport stadiumId startDateTime price')
    .lean()
    .exec();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    bookingNumber: doc.bookingNumber,
    quantity: doc.quantity,
    totalAmount: doc.totalAmount,
    bookingStatus: doc.bookingStatus,
    paymentStatus: doc.paymentStatus,
    bookedAt: doc.bookedAt || doc.createdAt,
    isActive: doc.isActive,
    event: doc.eventId || null,
  };
}

export async function cancelBooking({ userId, id }) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const doc = await Booking.findOne({ _id: id, userId }).exec();
  if (!doc) return false;
  if (doc.bookingStatus === 'cancelled') return true; // idempotent
  
  // mark booking as cancelled
  doc.bookingStatus = 'cancelled';
  if (doc.paymentStatus === 'paid') {
    doc.paymentStatus = 'refunded';
    
    // Update associated payment records if any
    const Payment = mongoose.models.Payment || mongoose.model('Payment');
    await Payment.updateMany({ bookingId: doc._id }, { $set: { paymentStatus: 'refunded' } }).exec();
  }
  await doc.save();

  // Cancel associated ticket(s) so QR verification fails
  const Ticket = mongoose.models.Ticket || mongoose.model('Ticket');
  await Ticket.updateMany({ bookingId: doc._id }, { $set: { ticketStatus: 'cancelled' } }).exec();

  // restore seats
  await Event.findByIdAndUpdate(doc.eventId, { $inc: { availableSeats: doc.quantity } }).exec();
  return true;
}