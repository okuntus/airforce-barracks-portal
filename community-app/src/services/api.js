const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token helpers
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
}

// Auth
export const authApi = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email, password, displayName, role) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName, role }) }),
  me: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  setToken,
  removeToken,
  getToken
};

// Alerts
export const alertsApi = {
  getAll: () => request('/alerts'),
  create: (data) => request('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/alerts/${id}`, { method: 'DELETE' })
};

// Events
export const eventsApi = {
  getAll: () => request('/events'),
  create: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/events/${id}`, { method: 'DELETE' })
};

// Announcements
export const announcementsApi = {
  getAll: () => request('/announcements'),
  create: (data) => request('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/announcements/${id}`, { method: 'DELETE' })
};

// Stats
export const statsApi = {
  get: () => request('/stats')
};

// Users (admin only)
export const usersApi = {
  getAll: () => request('/users'),
  create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' })
};
