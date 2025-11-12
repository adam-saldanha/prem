import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const clubsAPI = {
  getAll: () => api.get('/clubs'),
  getById: (id) => api.get(`/clubs/${id}`),
  fetchSquad: (id) => api.post(`/clubs/${id}/fetch-squad`),
  create: (club) => api.post('/clubs', club),
  update: (id, club) => api.put(`/clubs/${id}`, club),
  delete: (id) => api.delete(`/clubs/${id}`),
};

export const playersAPI = {
  getAll: () => api.get('/players'),
  getById: (id) => api.get(`/players/${id}`),
  getByClub: (clubId) => api.get(`/players/club/${clubId}`),
  getTopScorers: (limit = 10) => api.get(`/players/top-scorers?limit=${limit}`),
  getTopAssists: (limit = 10) => api.get(`/players/top-assists?limit=${limit}`),
  create: (player) => api.post('/players', player),
  update: (id, player) => api.put(`/players/${id}`, player),
  delete: (id) => api.delete(`/players/${id}`),
};

export const matchesAPI = {
  getAll: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`),
  getByClub: (clubId) => api.get(`/matches/club/${clubId}`),
  getUpcoming: () => api.get('/matches/upcoming'),
  getLive: () => api.get('/matches/live'),
  getBySeason: (season) => api.get(`/matches/season/${season}`),
  create: (match) => api.post('/matches', match),
  update: (id, match) => api.put(`/matches/${id}`, match),
  delete: (id) => api.delete(`/matches/${id}`),
};

export const predictionsAPI = {
  getAll: () => api.get('/predictions'),
  getUpcoming: () => api.get('/predictions/upcoming'),
  getByWeek: (week) => api.get(`/predictions/week/${week}`),
  generate: () => api.post('/predictions/generate'),
};

export const dataAPI = {
  refresh: () => api.post('/data/refresh'),
  getStatus: () => api.get('/data/status'),
};

export default api;
