import mongoose from 'mongoose';
import Event from '../models/event.model.js';
import Stadium from '../models/stadium.model.js';
import Booking from '../models/booking.model.js';
import Ticket from '../models/ticket.model.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const PUBLIC_SPORTS = ['Football', 'Soccer', 'American Football', 'Cricket', 'Basketball', 'Tennis', 'Hockey', 'Badminton'];

function toDTO(doc) {
  if (!doc) return null;
  const dto = {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    sport: doc.sport,
    organizer: doc.organizer,
    bannerImage: doc.bannerImage || null,
    startDateTime: doc.startDateTime,
    endDateTime: doc.endDateTime,
    ticketBookingStart: doc.ticketBookingStart,
    ticketBookingEnd: doc.ticketBookingEnd,
    totalSeats: doc.totalSeats,
    availableSeats: doc.availableSeats,
    price: doc.price,
    status: doc.status,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  if (doc.stadiumId) {
    if (typeof doc.stadiumId === 'object' && doc.stadiumId._id) {
      dto.stadiumId = doc.stadiumId._id.toString();
      dto.stadium = {
        id: doc.stadiumId._id.toString(),
        name: doc.stadiumId.name,
        city: doc.stadiumId.city,
        country: doc.stadiumId.country,
      };
    } else {
      dto.stadiumId = doc.stadiumId.toString();
    }
  }

  return dto;
}

export async function createEvent(payload) {
  // verify stadium exists and active
  const stadium = await Stadium.findOne({ _id: payload.stadiumId, isActive: true }).lean().exec();
  if (!stadium) {
    const err = new Error('Stadium not found or inactive');
    err.statusCode = 400;
    throw err;
  }

  const doc = new Event({
    stadiumId: payload.stadiumId,
    title: payload.title,
    description: payload.description,
    sport: payload.sport,
    organizer: payload.organizer,
    bannerImage: payload.bannerImage || null,
    startDateTime: payload.startDateTime,
    endDateTime: payload.endDateTime,
    ticketBookingStart: payload.ticketBookingStart,
    ticketBookingEnd: payload.ticketBookingEnd,
    totalSeats: payload.totalSeats,
    // initialize availableSeats to totalSeats
    availableSeats: typeof payload.totalSeats === 'number' ? payload.totalSeats : payload.availableSeats,
    price: typeof payload.price === 'number' ? payload.price : 0,
    // status defaults to 'scheduled' per schema
  });

  let saved;
  let attempts = 0;
  const maxAttempts = 5;
  while (attempts < maxAttempts) {
    try {
      saved = await doc.save();
      break;
    } catch (err) {
      if (err.code === 11000 && (err.message.includes('slug') || (err.keyValue && 'slug' in err.keyValue))) {
        attempts += 1;
        const randomHex = Math.random().toString(36).substring(2, 6);
        doc.slug = `${doc.slug || 'event'}-${randomHex}`;
      } else {
        throw err;
      }
    }
  }

  if (!saved) {
    throw new Error('Failed to save event due to duplicate slug after multiple attempts');
  }

  return toDTO(saved);
}

export async function getAllEvents({ filters = {}, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sort = null } = {}) {
  const q = {};
  if (filters.stadiumId) q.stadiumId = filters.stadiumId;
  if (filters.sport) q.sport = filters.sport;
  if (filters.status) q.status = filters.status;
  if (filters.sportsOnly) q.sport = { $in: PUBLIC_SPORTS };
  if (filters.minPrice) q.price = { $gte: parseFloat(filters.minPrice) };
  if (filters.maxPrice) q.price = { ...(q.price || {}), $lte: parseFloat(filters.maxPrice) };
  // exclude inactive
  q.isActive = true;

  // date filters
  if (filters.upcoming) {
    q.startDateTime = { $gte: new Date() };
  }
  if (filters.completed) {
    q.endDateTime = { $lt: new Date() };
  }
  if (filters.startDateFrom || filters.startDateTo) {
    q.startDateTime = q.startDateTime || {};
    if (filters.startDateFrom) q.startDateTime.$gte = new Date(filters.startDateFrom);
    if (filters.startDateTo) q.startDateTime.$lte = new Date(filters.startDateTo);
  }

  // text search
  if (filters.q) {
    q.$text = { $search: filters.q };
  }

  // city filter via stadium lookup
  if (filters.city) {
    const stadiums = await Stadium.find({ city: { $regex: `^${filters.city}$`, $options: 'i' }, isActive: true }).lean().exec();
    const ids = stadiums.map((s) => s._id);
    q.stadiumId = { $in: ids };
  }

  let query = Event.find(q).populate('stadiumId').lean();

  // sorting
  if (sort) query = query.sort(sort);
  else query = query.sort({ startDateTime: 1 });

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const docs = await query.skip(skip).limit(parseInt(limit, 10)).exec();
  const total = await Event.countDocuments(q).exec();

  return {
    data: docs.map(toDTO),
    meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
  };
}

export async function getEventById(idOrSlug) {
  if (!idOrSlug) return null;
  let doc;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    doc = await Event.findOne({ _id: idOrSlug, isActive: true }).populate('stadiumId').exec();
  } else {
    doc = await Event.findOne({ slug: String(idOrSlug).toLowerCase().trim(), isActive: true }).populate('stadiumId').exec();
  }
  return toDTO(doc);
}

export async function updateEvent(id, updates) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const cleaned = { ...updates };
  delete cleaned.slug;
  delete cleaned.availableSeats; // managed by system / bookings
  
  // stadiumId is kept immutable to prevent breaking existing bookings
  delete cleaned.stadiumId; 
  
  const doc = await Event.findOneAndUpdate({ _id: id, isActive: true }, { $set: cleaned }, { new: true }).exec();
  return toDTO(doc);
}

export async function deleteEvent(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;

  const activeBookingsCount = await Booking.countDocuments({
    eventId: id,
    bookingStatus: { $ne: 'cancelled' },
    isActive: true
  }).exec();

  if (activeBookingsCount > 0) {
    const err = new Error('Cannot delete event: active bookings or tickets exist.');
    err.statusCode = 400;
    throw err;
  }

  const doc = await Event.findOneAndUpdate({ _id: id, isActive: true }, { $set: { isActive: false } }, { new: true }).exec();
  return !!doc;
}
