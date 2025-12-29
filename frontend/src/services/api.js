// src/services/api.js

import axios from 'axios';

// Cloudinary configuration
export const CLOUDINARY_CLOUD_NAME = 'dkq9qo8vf';

// Use the correct environment variable for backend host, fallback to Render backend, and ensure /api is appended
const base = import.meta.env.VITE_API_BASE_URL || 'https://ego-store-backend.onrender.com';
const API_URL = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Basic error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      error.message = 'Backend is unavailable or waking up. Please try again.';
    }
    return Promise.reject(error);
  }
);

export default api;
