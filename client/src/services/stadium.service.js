import api from '../api/axios';

/**
 * Build cleaned params object by removing empty/null values.
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

export async function getAllStadiums(filters = {}) {
  const params = buildParams(filters);
  return api.get('/stadiums', { params });
}

export async function getStadium(id) {
  if (!id) throw new Error('stadium id is required');
  return api.get(`/stadiums/${id}`);
}

export async function createStadium(payload) {
  return api.post('/stadiums', payload);
}

export async function updateStadium(id, payload) {
  if (!id) throw new Error('stadium id is required');
  return api.put(`/stadiums/${id}`, payload);
}

export async function deleteStadium(id) {
  if (!id) throw new Error('stadium id is required');
  return api.delete(`/stadiums/${id}`);
}