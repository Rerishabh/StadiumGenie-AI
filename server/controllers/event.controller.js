import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../services/event.service.js';
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
    const dto = await createEvent(req.body);
    return res.status(201).json({
      success: true,
      message: 'Event created',
      data: { event: dto },
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
    console.error('create event error', e && e.message ? e.message : e);
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
    const filters = {
      stadiumId: req.query.stadiumId,
      sport: req.query.sport,
      city: req.query.city,
      status: req.query.status,
      upcoming: req.query.upcoming === 'true' || req.query.upcoming === true,
      completed: req.query.completed === 'true' || req.query.completed === true,
      startDateFrom: req.query.startDateFrom,
      startDateTo: req.query.startDateTo,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      q: req.query.q,
      sportsOnly: req.query.sportsOnly === 'true' || req.query.sportsOnly === true,
    };
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const result = await getAllEvents({ filters, page, limit });
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (e) {
    console.error('list events error', e && e.message ? e.message : e);
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
    const id = req.params.id;
    const ev = await getEventById(id);
    if (!ev) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        errors: [],
        statusCode: 404,
      });
    }
    return res.status(200).json({
      success: true,
      data: { event: ev },
    });
  } catch (e) {
    console.error('get event error', e && e.message ? e.message : e);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}

export async function update(req, res) {
  const v = validationResult(req);
  if (!v.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: v.array(),
      statusCode: 422,
    });
  }
  try {
    const id = req.params.id;
    const dto = await updateEvent(id, req.body);
    if (!dto) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        errors: [],
        statusCode: 404,
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Event updated',
      data: { event: dto },
    });
  } catch (e) {
    console.error('update event error', e && e.message ? e.message : e);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}

export async function remove(req, res) {
  try {
    const id = req.params.id;
    const ok = await deleteEvent(id);
    if (!ok) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        errors: [],
        statusCode: 404,
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Event deleted',
      data: { id },
    });
  } catch (e) {
    console.error('delete event error', e && e.message ? e.message : e);
    const status = e.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: e.message || 'Internal server error',
      errors: [],
      statusCode: status,
    });
  }
}
