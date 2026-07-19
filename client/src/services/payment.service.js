import api from '../api/axios';

/**
 * Execute simulated payment processing.
 * @param {Object} payload { bookingId, paymentMethod }
 */
export async function createPayment(payload) {
  return api.post('/payments', payload);
}

/**
 * List all payments for the authenticated user.
 * @param {Object} params { page, limit }
 */
export async function getUserPayments(params = {}) {
  return api.get('/payments', { params });
}

/**
 * Get payment details by ID.
 * @param {string} id
 */
export async function getPayment(id) {
  if (!id) throw new Error('payment id is required');
  return api.get(`/payments/${id}`);
}

/**
 * Confirm a simulated payment on the backend.
 * @param {Object} payload { paymentId }
 */
export async function confirmPayment(payload) {
  return api.post('/payments/confirm', payload);
}