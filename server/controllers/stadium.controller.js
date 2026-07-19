import {
  createStadium,
  getAllStadiums,
  getStadiumById,
  updateStadium,
  deleteStadium,
} from '../services/stadium.service.js';
import { validationResult } from 'express-validator';

/* Helpers */
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

/* Controllers */

export async function create(req, res) {
  const v = validationErrors(req, res);
  if (v) return v;
  try {
    const dto = await createStadium(req.body);
    return res.status(201).json({
      success: true,
      message: 'Stadium created',
      data: { stadium: dto },
    });
  } catch (e) {
    console.error('create stadium error', e && e.message ? e.message : e);
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
      city: req.query.city,
      state: req.query.state,
      country: req.query.country,
      sport: req.query.sport,
      minCapacity: req.query.minCapacity,
      q: req.query.q,
    };
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const result = await getAllStadiums({ filters, page, limit });
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (e) {
    console.error('list stadiums error', e && e.message ? e.message : e);
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
    const stadium = await getStadiumById(id);
    if (!stadium) {
      return res.status(404).json({
        success: false,
        message: 'Stadium not found',
        errors: [],
        statusCode: 404,
      });
    }
    return res.status(200).json({
      success: true,
      data: { stadium },
    });
  } catch (e) {
    console.error('get stadium error', e && e.message ? e.message : e);
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
    const dto = await updateStadium(id, req.body);
    if (!dto) {
      return res.status(404).json({
        success: false,
        message: 'Stadium not found',
        errors: [],
        statusCode: 404,
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Stadium updated',
      data: { stadium: dto },
    });
  } catch (e) {
    console.error('update stadium error', e && e.message ? e.message : e);
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
    const ok = await deleteStadium(id);
    if (!ok) {
      return res.status(404).json({
        success: false,
        message: 'Stadium not found',
        errors: [],
        statusCode: 404,
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Stadium deleted',
      data: { id },
    });
  } catch (e) {
    console.error('delete stadium error', e && e.message ? e.message : e);
    const status = e.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: e.message || 'Internal server error',
      errors: [],
      statusCode: status,
    });
  }
}