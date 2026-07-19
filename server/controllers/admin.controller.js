import * as adminService from '../services/admin.service.js';

function success(res, data, meta = {}) {
  return res.status(200).json({ success: true, data, meta });
}

function failure(res, statusCode, message = 'Error', errors = []) {
  return res.status(statusCode).json({ success: false, message, errors, statusCode });
}

export async function dashboard(req, res) {
  try {
    const data = await adminService.getDashboardSummary();
    return success(res, data);
  } catch (e) {
    console.error('admin dashboard error', e && e.message ? e.message : e);
    return failure(res, 500, 'Internal server error', []);
  }
}

export async function recentBookings(req, res) {
  try {
    const result = await adminService.getRecentBookings({ limit: req.query.limit || 10 });
    return success(res, result.data, result.meta);
  } catch (e) {
    console.error('recent bookings error', e && e.message ? e.message : e);
    return failure(res, 500, 'Internal server error', []);
  }
}

export async function recentPayments(req, res) {
  try {
    const result = await adminService.getRecentPayments({ limit: req.query.limit || 10 });
    return success(res, result.data, result.meta);
  } catch (e) {
    console.error('recent payments error', e && e.message ? e.message : e);
    return failure(res, 500, 'Internal server error', []);
  }
}

export async function recentTickets(req, res) {
  try {
    const result = await adminService.getRecentTickets({ limit: req.query.limit || 10 });
    return success(res, result.data, result.meta);
  } catch (e) {
    console.error('recent tickets error', e && e.message ? e.message : e);
    return failure(res, 500, 'Internal server error', []);
  }
}

export async function eventsStats(req, res) {
  try {
    const data = await adminService.getEventStatistics();
    return success(res, data);
  } catch (e) {
    console.error('events stats error', e && e.message ? e.message : e);
    return failure(res, 500, 'Internal server error', []);
  }
}

export async function stadiumsStats(req, res) {
  try {
    const data = await adminService.getStadiumStatistics();
    return success(res, data);
  } catch (e) {
    console.error('stadiums stats error', e && e.message ? e.message : e);
    return failure(res, 500, 'Internal server error', []);
  }
}

export async function listBookings(req, res) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const status = req.query.status || null;
    const result = await adminService.getAllBookingsAdmin({ page, limit, status });
    return success(res, result.data, result.meta);
  } catch (e) {
    console.error('admin listBookings error', e && e.message ? e.message : e);
    return failure(res, 500, 'Internal server error', []);
  }
}

export async function listUsers(req, res) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const result = await adminService.getAllUsersAdmin({ page, limit });
    return success(res, result.data, result.meta);
  } catch (e) {
    console.error('admin listUsers error', e && e.message ? e.message : e);
    return failure(res, 500, 'Internal server error', []);
  }
}