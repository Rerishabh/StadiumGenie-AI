import api from '../api/axios';

/**
 * Create a new booking for an event.
 * @param {Object} payload { eventId, quantity }
 */
export async function createBooking(payload) {
  return api.post('/bookings', payload);
}

/**
 * Get all bookings for the logged-in user.
 * @param {Object} params { page, limit }
 */
export async function getUserBookings(params = {}) {
  return api.get('/bookings', { params });
}

/**
 * Get details of a single booking.
 * @param {string} id
 */
export async function getBooking(id) {
  if (!id) throw new Error('booking id is required');
  return api.get(`/bookings/${id}`);
}

/**
 * Cancel a booking.
 * @param {string} id
 */
export async function cancelBooking(id) {
  if (!id) throw new Error('booking id is required');
  return api.delete(`/bookings/${id}`);
}