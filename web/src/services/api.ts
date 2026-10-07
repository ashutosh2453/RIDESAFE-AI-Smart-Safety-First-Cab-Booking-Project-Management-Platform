import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ridesafe_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirecting if already on login or register
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthPage) {
        localStorage.removeItem('ridesafe_token');
        localStorage.removeItem('ridesafe_user');
        window.dispatchEvent(new Event('ridesafe_session_expired'));
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);
