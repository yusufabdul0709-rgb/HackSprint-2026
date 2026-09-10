import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// JWT interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trialbridge_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 interceptor — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('trialbridge_token');
      localStorage.removeItem('trialbridge_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
