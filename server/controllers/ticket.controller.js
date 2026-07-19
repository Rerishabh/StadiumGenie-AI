import { getMyTickets, getTicket, verifyTicketPublic, admitTicketPublic } from '../services/ticket.service.js';
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

export async function listTickets(req, res) {
  const v = validationErrors(req, res);
  if (v) return v;
  try {
    const userId = req.user && req.user.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const result = await getMyTickets({ userId, page, limit });
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (e) {
    console.error('list tickets error', e && e.message ? e.message : e);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}

export async function getTicketById(req, res) {
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
    const ticket = await getTicket({ userId, id });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
        errors: [],
        statusCode: 404,
      });
    }
    return res.status(200).json({
      success: true,
      data: { ticket },
    });
  } catch (e) {
    console.error('get ticket error', e && e.message ? e.message : e);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}

export async function verifyPublic(req, res) {
  try {
    const { ticketNumber } = req.params;
    const result = await verifyTicketPublic(ticketNumber);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    console.error('verify public ticket error', e && e.message ? e.message : e);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500
    });
  }
}

export async function admitPublic(req, res) {
  try {
    const { ticketNumber } = req.params;
    const result = await admitTicketPublic(ticketNumber);
    return res.status(200).json({
      success: true,
      message: 'Ticket scanned successfully',
      data: result
    });
  } catch (e) {
    if (e && e.statusCode) {
      return res.status(e.statusCode).json({
        success: false,
        message: e.message || 'Error admitting ticket',
        statusCode: e.statusCode
      });
    }
    console.error('admit public ticket error', e && e.message ? e.message : e);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500
    });
  }
}