import mongoose from 'mongoose';
import Stadium from '../models/stadium.model.js';
import Event from '../models/event.model.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function toDTO(doc) {
  if (!doc) return null;
  // Derive lat/lng from GeoJSON if flat fields aren't stored
  let lat = doc.latitude ?? null;
  let lng = doc.longitude ?? null;
  if (lat === null && doc.location && Array.isArray(doc.location.coordinates) && doc.location.coordinates.length === 2) {
    lng = doc.location.coordinates[0];
    lat = doc.location.coordinates[1];
  }
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    city: doc.city,
    state: doc.state || null,
    country: doc.country || null,
    address: doc.address || null,
    description: doc.description || null,
    capacity: doc.capacity,
    // Flat convenience fields
    imageUrl: doc.imageUrl || null,
    facilities: doc.facilities || [],
    latitude: lat,
    longitude: lng,
    // Rich nested fields
    sportsSupported: doc.sportsSupported || [],
    amenities: doc.amenities || [],
    images: doc.images || [],
    location: doc.location || null,
    rating: doc.rating,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createStadium(payload) {
  // Derive GeoJSON location from flat lat/lng if provided
  let location;
  if (typeof payload.latitude === 'number' && typeof payload.longitude === 'number') {
    location = { type: 'Point', coordinates: [payload.longitude, payload.latitude] };
  } else if (payload.location && typeof payload.location === 'object') {
    const { latitude, longitude } = payload.location;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      location = { type: 'Point', coordinates: [longitude, latitude] };
    }
  }

  const doc = new Stadium({
    name: payload.name,
    city: payload.city,
    state: payload.state,
    country: payload.country,
    address: payload.address,
    description: payload.description,
    capacity: payload.capacity,
    // Flat fields
    imageUrl: payload.imageUrl || undefined,
    facilities: payload.facilities || [],
    latitude: payload.latitude ?? undefined,
    longitude: payload.longitude ?? undefined,
    // Rich nested fields
    sportsSupported: payload.sportsSupported || [],
    amenities: payload.amenities || payload.facilities || [],
    images: payload.images || (payload.imageUrl ? [{ url: payload.imageUrl, alt: payload.name || '' }] : []),
    location: location || undefined,
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
        doc.slug = `${doc.slug || 'stadium'}-${randomHex}`;
      } else {
        throw err;
      }
    }
  }

  if (!saved) {
    throw new Error('Failed to save stadium due to duplicate slug after multiple attempts');
  }

  return toDTO(saved);
}

export async function getAllStadiums({ filters = {}, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sort = null } = {}) {
  const q = {};
  if (filters.city) q.city = { $regex: filters.city, $options: 'i' };
  if (filters.state) q.state = { $regex: `^${filters.state}$`, $options: 'i' };
  if (filters.country) q.country = { $regex: `^${filters.country}$`, $options: 'i' };
  if (filters.sport) q.sportsSupported = { $in: [filters.sport] };
  if (filters.minCapacity) q.capacity = { $gte: parseInt(filters.minCapacity, 10) };
  // exclude inactive by default
  q.isActive = true;

  let query;

  if (filters.q) {
    // Text search with name/city fallback for partial matches
    query = Stadium.find({
      ...q,
      $or: [
        { $text: { $search: filters.q } },
        { name: { $regex: filters.q, $options: 'i' } },
        { city: { $regex: filters.q, $options: 'i' } },
      ],
    }).lean();
  } else {
    query = Stadium.find(q).lean();
  }

  // sorting
  if (sort) {
    query = query.sort(sort);
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const docs = await query.skip(skip).limit(parseInt(limit, 10)).exec();

  // Count uses same query without text search complication
  const countQuery = filters.q
    ? { ...q, $or: [{ name: { $regex: filters.q, $options: 'i' } }, { city: { $regex: filters.q, $options: 'i' } }] }
    : q;
  const total = await Stadium.countDocuments(countQuery).exec();

  return {
    data: docs.map(toDTO),
    meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
  };
}

export async function getStadiumById(idOrSlug) {
  if (!idOrSlug) return null;
  let doc;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    doc = await Stadium.findOne({ _id: idOrSlug, isActive: true }).exec();
  } else {
    doc = await Stadium.findOne({ slug: String(idOrSlug).toLowerCase().trim(), isActive: true }).exec();
  }
  return toDTO(doc);
}

export async function updateStadium(id, updates) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  // Prevent slug and rating modification from API callers
  const cleaned = { ...updates };
  delete cleaned.slug;
  delete cleaned.rating;

  // Handle flat lat/lng -> derive GeoJSON location if both present
  const lat = typeof cleaned.latitude === 'number' ? cleaned.latitude : undefined;
  const lng = typeof cleaned.longitude === 'number' ? cleaned.longitude : undefined;
  if (lat !== undefined && lng !== undefined) {
    cleaned.location = { type: 'Point', coordinates: [lng, lat] };
  }

  // Handle nested { latitude, longitude } location object from older callers
  if (cleaned.location && typeof cleaned.location === 'object' && !cleaned.location.type) {
    const { latitude, longitude } = cleaned.location;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      cleaned.location = { type: 'Point', coordinates: [longitude, latitude] };
      // Also update flat fields for consistency
      if (cleaned.latitude === undefined) cleaned.latitude = latitude;
      if (cleaned.longitude === undefined) cleaned.longitude = longitude;
    } else {
      delete cleaned.location;
    }
  }

  // Keep amenities in sync with facilities if facilities is provided
  if (Array.isArray(cleaned.facilities) && !Array.isArray(cleaned.amenities)) {
    cleaned.amenities = cleaned.facilities;
  }
  // Keep images in sync with imageUrl if imageUrl updated without explicit images
  if (cleaned.imageUrl && !cleaned.images) {
    cleaned.images = [{ url: cleaned.imageUrl, alt: cleaned.name || '' }];
  }

  const doc = await Stadium.findOneAndUpdate(
    { _id: id, isActive: true },
    { $set: cleaned },
    { new: true }
  ).exec();
  return toDTO(doc);
}

export async function deleteStadium(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;

  const activeEventsCount = await Event.countDocuments({ stadiumId: id, isActive: true }).exec();
  if (activeEventsCount > 0) {
    const err = new Error('Cannot delete stadium: active events are scheduled at this venue.');
    err.statusCode = 400;
    throw err;
  }

  const doc = await Stadium.findOneAndUpdate(
    { _id: id, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  ).exec();
  return !!doc;
}
