import mongoose from 'mongoose';
import qrcode from 'qrcode';
import Ticket from '../models/ticket.model.js';
import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import Event from '../models/event.model.js';
import Stadium from '../models/stadium.model.js';

function formatDateYYYYMMDD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function generateTicketNumber() {
  const datePart = formatDateYYYYMMDD(new Date());
  const prefix = `TKT-${datePart}-`;
  const doc = await Ticket.findOne({ ticketNumber: { $regex: `^${prefix}` } })
    .sort({ ticketNumber: -1 })
    .lean()
    .exec();
  if (!doc || !doc.ticketNumber) return `${prefix}0001`;
  const parts = doc.ticketNumber.split('-');
  const last = parts[2] || '0000';
  const next = String(parseInt(last, 10) + 1).padStart(4, '0');
  return `${prefix}${next}`;
}

function toDTO(doc) {
  if (!doc) return null;
  const dto = {
    id: doc._id.toString(),
    ticketNumber: doc.ticketNumber,
    ticketStatus: doc.ticketStatus,
    qrCode: doc.qrCode,
    issuedAt: doc.issuedAt,
    isActive: doc.isActive,
    paymentId: doc.paymentId,
    eventId: doc.eventId && doc.eventId._id ? doc.eventId._id.toString() : (doc.eventId ? doc.eventId.toString() : null),
    userId: doc.userId,
    stadiumId: doc.stadiumId && doc.stadiumId._id ? doc.stadiumId._id.toString() : (doc.stadiumId ? doc.stadiumId.toString() : null),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  if (doc.bookingId) {
    if (typeof doc.bookingId === 'object' && doc.bookingId._id) {
      dto.bookingId = doc.bookingId._id.toString();
      dto.booking = {
        id: doc.bookingId._id.toString(),
        bookingNumber: doc.bookingId.bookingNumber,
        bookingStatus: doc.bookingId.bookingStatus,
        paymentStatus: doc.bookingId.paymentStatus,
      };
    } else {
      dto.bookingId = doc.bookingId.toString();
    }
  }

  if (doc.eventId && typeof doc.eventId === 'object') {
    dto.event = {
      id: doc.eventId._id ? doc.eventId._id.toString() : null,
      title: doc.eventId.title,
      startDateTime: doc.eventId.startDateTime,
      endDateTime: doc.eventId.endDateTime,
      sport: doc.eventId.sport,
      price: doc.eventId.price,
    };
  }

  if (doc.stadiumId && typeof doc.stadiumId === 'object') {
    dto.stadium = {
      id: doc.stadiumId._id ? doc.stadiumId._id.toString() : null,
      name: doc.stadiumId.name,
      city: doc.stadiumId.city,
      state: doc.stadiumId.state,
    };
  }

  return dto;
}

export async function createTicket(paymentId) {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    const err = new Error('Invalid paymentId');
    err.statusCode = 422;
    throw err;
  }

  const payment = await Payment.findById(paymentId).lean().exec();
  if (!payment) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }

  if (payment.paymentStatus !== 'success' && payment.paymentMethod !== 'cash') {
    const err = new Error('Payment not successful');
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.findById(payment.bookingId).lean().exec();
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  if (booking.bookingStatus !== 'confirmed') {
    const err = new Error('Booking not confirmed');
    err.statusCode = 400;
    throw err;
  }

  // Check if tickets are already created for this booking
  const existingDocs = await Ticket.find({ bookingId: booking._id })
    .populate('eventId')
    .populate('stadiumId')
    .exec();
  if (existingDocs.length > 0) {
    return toDTO(existingDocs[0]);
  }

  const event = await Event.findById(booking.eventId).lean().exec();
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  const stadium = await Stadium.findById(event.stadiumId).lean().exec();

  const savedList = [];
  const qty = booking.quantity || 1;

  // Generate a separate unique ticket for each attendee
  for (let q = 0; q < qty; q++) {
    let ticketNumber;
    for (let i = 0; i < 5; i += 1) {
      ticketNumber = await generateTicketNumber();
      // eslint-disable-next-line no-await-in-loop
      const exists = await Ticket.findOne({ ticketNumber }).lean().exec();
      if (!exists) break;
      ticketNumber = null;
    }
    if (!ticketNumber) ticketNumber = `TKT-${Date.now()}-${q}`;

    // PUBLIC_APP_URL/verify-ticket/<secure-token>
    const appUrl = process.env.APP_PUBLIC_URL || 'http://localhost:5173';
    const qrCodeData = `${appUrl}/verify-ticket/${ticketNumber}`;
    // eslint-disable-next-line no-await-in-loop
    const qrCode = await qrcode.toDataURL(qrCodeData);

    const ticket = new Ticket({
      bookingId: booking._id,
      paymentId,
      eventId: event._id,
      userId: booking.userId,
      stadiumId: event.stadiumId,
      ticketNumber,
      qrCode,
      ticketStatus: 'active',
      issuedAt: new Date(),
    });

    // eslint-disable-next-line no-await-in-loop
    const saved = await ticket.save();
    savedList.push(saved);
  }

  // Dispatch ticket email asynchronously in the background
  try {
    const User = mongoose.models.User || mongoose.model('User');
    const user = await User.findById(booking.userId).lean().exec();
    if (user && user.email) {
      const { sendTicketEmail } = await import('./email.service.js');
      sendTicketEmail(user.email, {
        userName: user.name,
        ticketNumber: savedList[0].ticketNumber + (qty > 1 ? ` (and ${qty - 1} more)` : ''),
        eventTitle: event.title,
        stadiumName: stadium ? stadium.name : 'Stadium Arena',
        quantity: booking.quantity,
        totalAmount: booking.totalAmount,
        qrCode: savedList[0].qrCode,
      }).catch(err => {
        console.error('Background sendTicketEmail error:', err);
      });
    }
  } catch (err) {
    console.error('Failed to trigger background ticket email:', err);
  }

  return toDTO(savedList[0]);
}

export async function getMyTickets({ userId, page = 1, limit = 20 } = {}) {
  const q = { userId };
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const docs = await Ticket.find(q)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate('eventId')
    .populate('stadiumId')
    .populate('bookingId')
    .lean()
    .exec();
  const total = await Ticket.countDocuments(q).exec();
  return {
    data: docs.map((d) => toDTO(d)),
    meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
  };
}

export async function getTicket({ userId, id }) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await Ticket.findOne({ _id: id, userId })
    .populate('eventId')
    .populate('stadiumId')
    .populate('bookingId')
    .lean()
    .exec();
  if (!doc) return null;
  return toDTO(doc);
}

/**
 * Publicly verify ticket by number (used by gate/checker verification page).
 */
export async function verifyTicketPublic(ticketNumber) {
  const ticket = await Ticket.findOne({ ticketNumber })
    .populate('eventId')
    .populate('stadiumId')
    .populate('userId', 'name email')
    .populate('bookingId')
    .exec();

  if (!ticket) {
    return { status: 'INVALID', message: 'Ticket not found' };
  }

  const booking = ticket.bookingId;
  const event = ticket.eventId;
  const stadium = ticket.stadiumId;
  const user = ticket.userId;

  let status = 'INVALID';
  if (ticket.ticketStatus === 'cancelled' || (booking && booking.bookingStatus === 'cancelled')) {
    status = 'CANCELLED';
  } else if (ticket.ticketStatus === 'used') {
    status = 'USED';
  } else if (booking && booking.paymentStatus === 'pending') {
    status = 'PAYMENT PENDING';
  } else if (event && new Date(event.endDateTime) < new Date()) {
    status = 'EXPIRED';
  } else if (ticket.ticketStatus === 'active' && booking && booking.bookingStatus === 'confirmed') {
    status = 'VALID';
  }

  return {
    status,
    ticketNumber: ticket.ticketNumber,
    issuedAt: ticket.issuedAt,
    holderName: user ? user.name : 'N/A',
    bookingReference: booking ? booking.bookingNumber : 'N/A',
    event: event ? {
      title: event.title,
      sport: event.sport,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
    } : null,
    stadium: stadium ? {
      name: stadium.name,
      city: stadium.city,
      country: stadium.country,
    } : null,
  };
}

/**
 * Publicly mark a ticket as admitted (USED) when scanned at gate.
 */
export async function admitTicketPublic(ticketNumber) {
  const ticket = await Ticket.findOne({ ticketNumber })
    .populate('bookingId')
    .exec();

  if (!ticket) {
    const err = new Error('Ticket not found');
    err.statusCode = 404;
    throw err;
  }

  const booking = ticket.bookingId;

  if (ticket.ticketStatus === 'cancelled' || (booking && booking.bookingStatus === 'cancelled')) {
    const err = new Error('Cannot admit: Ticket is cancelled');
    err.statusCode = 400;
    throw err;
  }

  if (ticket.ticketStatus === 'used') {
    return { success: true, alreadyUsed: true, ticketNumber };
  }

  if (booking && booking.paymentStatus === 'pending') {
    const err = new Error('Cannot admit: Payment is pending');
    err.statusCode = 400;
    throw err;
  }

  ticket.ticketStatus = 'used';
  await ticket.save();

  return { success: true, alreadyUsed: false, ticketNumber };
}