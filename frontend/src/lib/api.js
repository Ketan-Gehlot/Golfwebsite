import axios from 'axios';

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/users/me');
export const updateProfile = (data) => api.put('/users/me', data);

// Subscriptions
export const getPlans = () => api.get('/subscriptions/plans');
export const createCheckout = (data) => api.post('/subscriptions/checkout', data);
export const checkPaymentStatus = (sessionId) => api.get(`/subscriptions/status/${sessionId}`);
export const cancelSubscription = () => api.delete('/subscriptions');

// Scores
export const getScores = () => api.get('/scores');
export const addScore = (data) => api.post('/scores', data);
export const updateScore = (id, data) => api.put(`/scores/${id}`, data);
export const deleteScore = (id) => api.delete(`/scores/${id}`);

// Charities
export const getCharities = (params) => api.get('/charities', { params });
export const getCharity = (id) => api.get(`/charities/${id}`);
export const setMyCharity = (data) => api.post('/users/me/charity', data);
export const getMyCharity = () => api.get('/users/me/charity');

// Donations
export const createDonationCheckout = (data) => api.post('/donations/checkout', data);
export const checkDonationStatus = (sessionId) => api.get(`/donations/status/${sessionId}`);

// Draws
export const getDraws = () => api.get('/draws');
export const getDraw = (id) => api.get(`/draws/${id}`);
export const enterDraw = (id) => api.post(`/draws/${id}/enter`);
export const getMyDraws = () => api.get('/users/me/draws');
export const getMyWinnings = () => api.get('/users/me/winnings');

// Winner Verification
export const submitVerification = (entryId, data) => api.post(`/winners/${entryId}/verify`, data);

// Admin
export const adminGetUsers = () => api.get('/admin/users');
export const adminGetUser = (id) => api.get(`/admin/users/${id}`);
export const adminUpdateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const adminUpdateScore = (userId, scoreId, data) => api.put(`/admin/users/${userId}/scores/${scoreId}`, data);
export const adminCreateCharity = (data) => api.post('/charities', data);
export const adminUpdateCharity = (id, data) => api.put(`/charities/${id}`, data);
export const adminDeleteCharity = (id) => api.delete(`/charities/${id}`);
export const adminCreateDraw = (data) => api.post('/admin/draws', data);
export const adminSimulateDraw = (id) => api.post(`/admin/draws/${id}/simulate`);
export const adminPublishDraw = (id, data) => api.post(`/admin/draws/${id}/publish`, data);
export const adminGetWinners = () => api.get('/admin/winners');
export const adminReviewWinner = (id, data) => api.put(`/admin/winners/${id}/review`, data);
export const adminMarkPayout = (id, data) => api.put(`/admin/winners/${id}/payout`, data);
export const adminGetAnalytics = () => api.get('/admin/analytics');

// Seed
export const seedData = () => api.post('/seed');

export default api;
