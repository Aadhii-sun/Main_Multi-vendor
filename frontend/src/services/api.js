// src/services/api.js

import axios from 'axios';

// Cloudinary configuration
export const CLOUDINARY_CLOUD_NAME = 'dkq9qo8vf';

// Detect if running locally (development mode)
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

// Use the correct environment variable for backend host
// In development, default to localhost; in production, use environment variable or Render backend
const getDefaultBase = () => {
  if (isDevelopment) {
    // Local development - use localhost
    return 'http://localhost:5000';
  }
  // Production - use environment variable or Render backend
  return import.meta.env.VITE_API_BASE_URL || 'https://ego-store-backend.onrender.com';
};

const base = getDefaultBase();
const API_URL = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;

// Log API URL in development for debugging
if (isDevelopment) {
  console.log('🔗 Frontend API Configuration:');
  console.log('   Base URL:', base);
  console.log('   API URL:', API_URL);
  console.log('   Environment:', import.meta.env.MODE);
}

// Create axios instance with CORS configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000,
  // CORS configuration
  withCredentials: true, // Send cookies and credentials with requests
  crossDomain: true, // Enable cross-domain requests
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Note: Don't set Origin header manually - browser sets it automatically
  // Setting it manually causes "Refused to set unsafe header" warning
  // The browser will automatically include the Origin header for CORS requests
  
  return config;
}, (error) => Promise.reject(error));

// Enhanced error handling with CORS error detection
api.interceptors.response.use(
  (response) => {
    // Log successful CORS requests in development
    if (import.meta.env.DEV && response.headers['access-control-allow-origin']) {
      console.debug('✅ CORS: Request successful', {
        origin: response.headers['access-control-allow-origin'],
        method: response.config.method,
        url: response.config.url
      });
    }
    return response;
  },
  (error) => {
    // Handle CORS errors specifically
    if (error.message === 'Network Error' && !error.response) {
      // This is likely a CORS error
      const corsError = new Error('CORS error: Unable to connect to backend. Check CORS configuration.');
      corsError.isCorsError = true;
      corsError.originalError = error;
      return Promise.reject(corsError);
    }
    
    // Handle other network errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      error.message = 'Backend is unavailable or waking up. Please try again.';
    }
    
    // Log CORS-related errors
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CORS')) {
      console.error('❌ CORS Error:', error.response.data.message);
      console.error('Frontend Origin:', window.location.origin);
      console.error('Backend URL:', API_URL);
    }
    
    return Promise.reject(error);
  }
);

export default api;
