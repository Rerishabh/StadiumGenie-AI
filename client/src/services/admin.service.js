import api from '../api/axios';

/**
 * Get admin dashboard summary stats.
 * Returns: totalUsers, totalStadiums, totalEvents, totalBookings, totalPayments,
 *          totalTickets, activeEvents, completedEvents, cancelledEvents,
 *          totalRevenue, totalSeatsBooked
 */
export async function getDashboardSummary() {
  return api.get('/admin/dashboard');
}

/**
 * Get recent bookings for admin view.
 * @param {number} limit
 */
export async function getRecentBookings(limit = 10) {
  return api.get('/admin/recent-bookings', { params: { limit } });
}

/**
 * Get recent payments for admin view.
 * @param {number} limit
 */
export async function getRecentPayments(limit = 10) {
  return api.get('/admin/recent-payments', { params: { limit } });
}

/**
 * Get recent tickets for admin view.
 * @param {number} limit
 */
export async function getRecentTickets(limit = 10) {
  return api.get('/admin/recent-tickets', { params: { limit } });
}

/**
 * Get event statistics (occupancy, booked seats, etc.)
 */
export async function getEventStats() {
  return api.get('/admin/events');
}

/**
 * Get stadium statistics (bookings, revenue per stadium)
 */
export async function getStadiumStats() {
  return api.get('/admin/stadiums');
}

export async function getBookingsAdmin(page = 1, limit = 20, status = '') {
  const params = { page, limit };
  if (status) params.status = status;
  return api.get('/admin/bookings', { params });
}

export async function getUsersAdmin(page = 1, limit = 20) {
  return api.get('/admin/users', { params: { page, limit } });
}