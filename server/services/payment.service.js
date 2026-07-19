import mongoose from 'mongoose';
import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';

function formatDateYYYYMMDD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function generatePaymentReference() {
  const datePart = formatDateYYYYMMDD(new Date());
  const prefix = `PAY-${datePart}-`;
  const doc = await Payment.findOne({ paymentReference: { $regex: `^${prefix}` } })
    .sort({ paymentReference: -1 })
    .lean()
    .exec();
  if (!doc || !doc.paymentReference) {
    return `${prefix}0001`;
  }
  const parts = doc.paymentReference.split('-');
  const last = parts[2] || '0000';
  const next = String(parseInt(last, 10) + 1).padStart(4, '0');
  return `${prefix}${next}`;
}

function toDTO(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    paymentReference: doc.paymentReference,
    bookingId: doc.bookingId,
    userId: doc.userId,
    amount: doc.amount,
    currency: doc.currency,
    paymentMethod: doc.paymentMethod,
    paymentStatus: doc.paymentStatus,
    transactionDate: doc.transactionDate,
    gateway: doc.gateway,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createPayment({ userId, bookingId, paymentMethod }) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const err = new Error('Invalid bookingId');
    err.statusCode = 422;
    throw err;
  }

  // load booking and verify ownership
  const booking = await Booking.findOne({ _id: bookingId }).exec();
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  if (String(booking.userId) !== String(userId)) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  if (booking.paymentStatus === 'paid') {
    const err = new Error('Booking already paid');
    err.statusCode = 400;
    throw err;
  }

  // amount comes from booking
  const amount = booking.totalAmount;

  // generate payment reference for simulated payment methods (retry)
  let paymentReference;
  for (let i = 0; i < 5; i += 1) {
    paymentReference = await generatePaymentReference();
    // eslint-disable-next-line no-await-in-loop
    const exists = await Payment.findOne({ paymentReference }).lean().exec();
    if (!exists) break;
    paymentReference = null;
  }
  if (!paymentReference) paymentReference = `PAY-${Date.now()}`;

  // create payment record
  const payment = new Payment({
    bookingId,
    userId,
    paymentReference,
    amount,
    paymentMethod,
    paymentStatus: 'pending',
    transactionDate: new Date(),
    gateway: 'simulated',
  });

  // simulate payment — always succeeds for demo reliability (no real payment provider needed)
  let finalStatus = 'failed';
  if (paymentMethod === 'cash') {
    finalStatus = 'pending'; // cash: seat reserved, payment pending at venue
  } else {
    finalStatus = 'success'; // card/upi/netbanking: always successful in demo
  }

  // persist payment and update booking status
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    payment.paymentStatus = finalStatus;
    await payment.save({ session });

    if (finalStatus === 'success') {
      booking.paymentStatus = 'paid';
      booking.bookingStatus = 'confirmed';
      await booking.save({ session });
    } else if (paymentMethod === 'cash') {
      booking.paymentStatus = 'pending';
      booking.bookingStatus = 'confirmed'; // reserved / confirmed seat reservation
      await booking.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }
 
  // attempt to create ticket asynchronously (idempotent)
  if (finalStatus === 'success' || paymentMethod === 'cash') {
    try {
      const { createTicket } = await import('./ticket.service.js');
      await createTicket(payment._id);
    } catch (err) {
      console.error('ticket creation failed', err && err.message ? err.message : err);
    }
  }
 
  return toDTO(payment);
}

export async function getAllPayments({ userId, page = 1, limit = 20 } = {}) {
  const q = { userId };
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const docs = await Payment.find(q).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean().exec();
  const total = await Payment.countDocuments(q).exec();
  return {
    data: docs.map((d) => toDTO(d)),
    meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
  };
}

export async function getPaymentById({ userId, id }) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await Payment.findOne({ _id: id, userId }).lean().exec();
  if (!doc) return null;
  return toDTO(doc);
}

export async function confirmPayment({ userId, paymentId }) {
  // Simulated payment confirmation - all payments are processed on creation
  return { success: true };
}

export async function handleWebhookEvent(rawBody, signature) {
  // Webhook handling is disabled for demo simulated payments
  return { received: true };
}