// src/services/api.js
import axios from 'axios';

// Default to localhost in development, production URL otherwise
const getApiUrl = () => {
  // Check if VITE_API_URL is explicitly set
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    // Ensure it ends with /api if not already included
    return url.endsWith('/api') ? url : (url.endsWith('/') ? `${url}api` : `${url}/api`);
  }
  
  // In development, default to localhost with /api
  if (import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // Production default - your Render backend host
  // The /api suffix will be automatically appended
  const prodUrl = 'https://ego-store.onrender.com';
  return prodUrl.endsWith('/api') ? prodUrl : `${prodUrl}/api`;
};

const API_URL = getApiUrl();

// Log API URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_URL);
  console.log('📝 Example: OTP endpoint will be:', `${API_URL}/otp/send`);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('[API] Request error:', error);
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout';
      error.isNetworkError = true;
    } else if (error.message === 'Network Error' || !error.response) {
      error.message = 'Network Error';
      error.isNetworkError = true;
    }
    return Promise.reject(error);
  }
);

export default api;
