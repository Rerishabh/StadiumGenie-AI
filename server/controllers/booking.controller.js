import { createBooking, getAllBookings, getBookingById, cancelBooking } from '../services/booking.service.js';
import { validationResult } from 'express-validator';

function validationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ message: e.msg, param: e.param })),
      statusCode: 422,
    });
  }
  return null;
}

export async function create(req, res) {
  const v = validationErrors(req, res);
  if (v) return v;
  try {
    const userId = req.user && req.user.id;
    const { eventId, quantity } = req.body;
    const booking = await createBooking({ userId, eventId, quantity });
    return res.status(201).json({
      success: true,
      message: 'Booking created',
      data: { booking },
    });
  } catch (e) {
    if (e && e.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: e.message || 'Bad request',
        errors: [],
        statusCode: 400,
      });
    }
    console.error('create booking error', e && e.message ? e.message : e);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}

export async function list(req, res) {
  const v = validationErrors(req, res);
  if (v) return v;
  try {
    const userId = req.user && req.user.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const result = await getAllBookings({ userId, page, limit });
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (e) {
    console.error('list bookings error', e && e.message ? e.message : e);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}

export async function getById(req, res) {
  const v = validationResult(req);
  if (!v.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid id',
      errors: v.array(),
      statusCode: 400,
    });
  }
  try {
    const userId = req.user && req.user.id;
    const id = req.params.id;
    const booking = await getBookingById({ userId, id });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        errors: [],
        statusCode: 404,
      });
    }
    return res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (e) {
    console.error('get booking error', e && e.message ? e.message : e);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}

export async function remove(req, res) {
  const v = validationResult(req);
  if (!v.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid id',
      errors: v.array(),
      statusCode: 400,
    });
  }
  try {
    const userId = req.user && req.user.id;
    const id = req.params.id;
    const ok = await cancelBooking({ userId, id });
    if (!ok) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        errors: [],
        statusCode: 404,
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Booking cancelled',
      data: { id },
    });
  } catch (e) {
    console.error('cancel booking error', e && e.message ? e.message : e);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}