// src/services/api.js

import axios from 'axios';

// Use a single environment variable for backend host
const API_URL = (import.meta.env.VITE_API_URL || 'https://ego-store-backend.onrender.com').replace(/\/$/, '');

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
