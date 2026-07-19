import api from '../api/axios';

export async function register(payload) {
  try {
    const res = await api.post('/auth/register', payload);
    return res;
  } catch (err) {
    throw err;
  }
}

export async function login(credentials) {
  try {
    const res = await api.post('/auth/login', credentials);
    return res;
  } catch (err) {
    throw err;
  }
}

export async function me() {
  try {
    const res = await api.get('/auth/me');
    return res;
  } catch (err) {
    throw err;
  }
}

export async function updateProfile(payload) {
  try {
    const res = await api.put('/auth/profile', payload);
    return res;
  } catch (err) {
    throw err;
  }
}
