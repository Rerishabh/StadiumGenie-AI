import User from '../models/user.model.js';
import Stadium from '../models/stadium.model.js';
import Event from '../models/event.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import Ticket from '../models/ticket.model.js';
import mongoose from 'mongoose';

export async function getDashboardSummary() {
  const [
    totalUsers,
    totalStadiums,
    totalEvents,
    totalBookings,
    totalPayments,
    totalTickets,
    activeEvents,
    completedEvents,
    cancelledEvents,
    revenueAgg,
    seatsAgg,
  ] = await Promise.all([
    User.countDocuments().exec(),
    Stadium.countDocuments({ isActive: true }).exec(),
    Event.countDocuments().exec(),
    Booking.countDocuments().exec(),
    Payment.countDocuments({ paymentStatus: 'success' }).exec(),
    Ticket.countDocuments().exec(),
    Event.countDocuments({ status: 'scheduled' }).exec(),
    Event.countDocuments({ status: 'completed' }).exec(),
    Event.countDocuments({ status: 'cancelled' }).exec(),
    Payment.aggregate([
      { $match: { paymentStatus: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).exec(),
    Booking.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]).exec(),
  ]);

  const totalRevenue = (revenueAgg && revenueAgg[0] && revenueAgg[0].total) || 0;
  const totalSeatsBooked = (seatsAgg && seatsAgg[0] && seatsAgg[0].total) || 0;

  return {
    totalUsers,
    totalStadiums,
    totalEvents,
    totalBookings,
    totalPayments,
    totalTickets,
    activeEvents,
    completedEvents,
    cancelledEvents,
    totalRevenue,
    totalSeatsBooked,
  };
}

export async function getRecentBookings({ limit = 10 } = {}) {
  const docs = await Booking.find()
    .sort({ bookedAt: -1 })
    .limit(parseInt(limit, 10))
    .populate('userId', 'id name email')
    .populate('eventId', 'id title startDateTime')
    .lean()
    .exec();
  const total = await Booking.countDocuments().exec();
  return { data: docs, meta: { page: 1, limit: parseInt(limit, 10), total } };
}

export async function getRecentPayments({ limit = 10 } = {}) {
  const docs = await Payment.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .populate('userId', 'id name email')
    .populate('bookingId', 'id bookingNumber eventId')
    .lean()
    .exec();
  const total = await Payment.countDocuments().exec();
  return { data: docs, meta: { page: 1, limit: parseInt(limit, 10), total } };
}

export async function getRecentTickets({ limit = 10 } = {}) {
  const docs = await Ticket.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .populate('userId', 'id name email')
    .populate('eventId', 'id title startDateTime')
    .lean()
    .exec();
  const total = await Ticket.countDocuments().exec();
  return { data: docs, meta: { page: 1, limit: parseInt(limit, 10), total } };
}

export async function getEventStatistics() {
  const events = await Event.find().lean().exec();

  const result = events.map((e) => {
    const totalSeats = e.totalSeats || 0;
    const availableSeats = e.availableSeats != null ? e.availableSeats : totalSeats;
    const bookedSeats = Math.max(0, totalSeats - availableSeats);
    const occupancyPercentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;
    return {
      eventId: e._id,
      title: e.title,
      stadium: e.stadiumId,
      availableSeats,
      totalSeats,
      bookedSeats,
      occupancyPercentage,
      status: e.status,
    };
  });

  return result;
}

export async function getStadiumStatistics() {
  const stadiums = await Stadium.find().lean().exec();
  const results = [];

  for (const s of stadiums) {
    const events = await Event.find({ stadiumId: s._id }).select('id title').lean().exec();
    const eventIds = events.map((ev) => ev._id);

    const totalBookings = await Booking.countDocuments({ eventId: { $in: eventIds } }).exec();

    // revenue: payments for bookings whose eventId is in eventIds
    const revenueAgg = await Payment.aggregate([
      { $match: { paymentStatus: 'success' } },
      {
        $lookup: {
          from: 'bookings',
          localField: 'bookingId',
          foreignField: '_id',
          as: 'booking',
        },
      },
      { $unwind: '$booking' },
      { $match: { 'booking.eventId': { $in: eventIds } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).exec();
    const revenue = (revenueAgg && revenueAgg[0] && revenueAgg[0].total) || 0;

    results.push({
      stadiumId: s._id,
      name: s.name,
      city: s.city,
      events,
      totalBookings,
      revenue,
    });
  }

  return results;
}

export async function getAllBookingsAdmin({ page = 1, limit = 20, status = null } = {}) {
  const q = { isActive: true };
  if (status) q.bookingStatus = status;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const docs = await Booking.find(q)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate('userId', 'id name email')
    .populate({
      path: 'eventId',
      select: 'id title startDateTime price stadiumId',
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
        user: d.userId ? {
          id: d.userId._id.toString(),
          name: d.userId.name,
          email: d.userId.email
        } : null,
        event: ev ? {
          id: ev._id.toString(),
          title: ev.title,
          startDateTime: ev.startDateTime,
          price: ev.price,
          stadium: ev.stadiumId || null
        } : null
      };
    }),
    meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total }
  };
}

export async function getAllUsersAdmin({ page = 1, limit = 20 } = {}) {
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const docs = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean()
    .exec();

  const total = await User.countDocuments().exec();
  return {
    data: docs.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt
    })),
    meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total }
  };
}