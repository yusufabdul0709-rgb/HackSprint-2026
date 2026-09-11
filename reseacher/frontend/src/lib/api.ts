import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${host}:8000/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
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
