import api from '../api/axios';

/**
 * Get all tickets for the logged-in user.
 * @param {Object} params { page, limit }
 */
export async function getUserTickets(params = {}) {
  return api.get('/tickets', { params });
}

/**
 * Get details of a single ticket by its ID.
 * @param {string} id
 */
export async function getTicket(id) {
  if (!id) throw new Error('ticket id is required');
  return api.get(`/tickets/${id}`);
}

/**
 * Publicly verify ticket by its unique ticketNumber (used by gate qr check-in).
 */
export async function verifyTicketPublic(ticketNumber) {
  if (!ticketNumber) throw new Error('ticketNumber is required');
  return api.get(`/tickets/public/verify/${ticketNumber}`);
}

/**
 * Publicly admit (scan check-in) a ticket by its unique ticketNumber.
 */
export async function admitTicketPublic(ticketNumber) {
  if (!ticketNumber) throw new Error('ticketNumber is required');
  return api.post(`/tickets/public/admit/${ticketNumber}`);
}