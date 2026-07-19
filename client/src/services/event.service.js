import api from '../api/axios';

/**
 * Build cleaned params object by removing empty values.
 * Accepts plain filter object.
 */
function buildParams(filters = {}) {
  const params = {};
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === 'string' && v.trim() === '') return;
    params[k] = v;
  });
  return params;
}

export async function getAllEvents(filters = {}) {
  const params = buildParams(filters);
  return api.get('/events', { params });
}

export async function getEvent(id) {
  if (!id) throw new Error('event id is required');
  return api.get(`/events/${id}`);
}

export async function createEvent(payload) {
  return api.post('/events', payload);
}

export async function updateEvent(id, payload) {
  if (!id) throw new Error('event id is required');
  return api.put(`/events/${id}`, payload);
}

export async function deleteEvent(id) {
  if (!id) throw new Error('event id is required');
  return api.delete(`/events/${id}`);
}