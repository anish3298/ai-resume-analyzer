import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE_URL });

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
};

// ---- Resumes ----
export const resumeAPI = {
  upload: (formData, onUploadProgress) =>
    api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  getAll: (params) => api.get('/resumes', { params }),
  getById: (id) => api.get(`/resumes/${id}`),
  delete: (id) => api.delete(`/resumes/${id}`),
};

// ---- Analysis ----
export const analysisAPI = {
  runATS: (resumeId, targetRole) => api.post(`/analysis/ats/${resumeId}`, { targetRole }),
  matchJD: (resumeId, data) => api.post(`/analysis/jd-match/${resumeId}`, data),
  getHistory: (params) => api.get('/analysis/history', { params }),
  getDashboardStats: () => api.get('/analysis/dashboard-stats'),
  downloadReport: (id) => api.get(`/analysis/${id}/report-pdf`, { responseType: 'blob' }),
};

// ---- Users ----
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

// ---- Admin ----
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getResumes: (params) => api.get('/admin/resumes', { params }),
  deleteResume: (id) => api.delete(`/admin/resumes/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
};

export default api;
