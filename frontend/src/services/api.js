// src/services/api.js
import axios from 'axios';

// Default to localhost in development, production URL otherwise
const getApiUrl = () => {
  // Check if VITE_API_URL is explicitly set (available at build time)
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl && viteApiUrl.trim() !== '') {
    const url = viteApiUrl.trim();
    // Ensure it ends with /api if not already included
    const apiUrl = url.endsWith('/api') ? url : (url.endsWith('/') ? `${url}api` : `${url}/api`);
    console.log('✅ Using VITE_API_URL:', apiUrl);
    return apiUrl;
  }
  
  // Detect if we're in development (localhost)
  const hostname = window.location.hostname;
  const isDevelopment = import.meta.env.DEV || 
                        hostname === 'localhost' || 
                        hostname === '127.0.0.1';
  
  if (isDevelopment) {
    const devUrl = 'http://localhost:5000/api';
    console.log('🔧 Development mode - using:', devUrl);
    return devUrl;
  }
  
  // Production - always use the backend URL (absolute URL required)
  // This ensures the frontend always connects to the correct backend
  const prodUrl = 'https://ego-store-backend.onrender.com';
  const apiUrl = prodUrl.endsWith('/api') ? prodUrl : `${prodUrl}/api`;
  
  console.warn('⚠️ VITE_API_URL not set. Using default production URL:', apiUrl);
  console.warn('💡 Set VITE_API_URL=https://ego-store-backend.onrender.com in Render and redeploy');
  console.log('🌐 Production mode detected. Hostname:', hostname);
  
  return apiUrl;
};

let API_URL = getApiUrl();

// Ensure API_URL is always an absolute URL (not relative)
if (!API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  console.error('❌ ERROR: API_URL is not an absolute URL:', API_URL);
  // Force production URL as fallback
  API_URL = 'https://ego-store-backend.onrender.com/api';
  console.log('🔧 Forced to use production URL:', API_URL);
}

// Log API URL in all environments for debugging
console.log('🔗 API Base URL:', API_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('🌍 DEV mode:', import.meta.env.DEV);
console.log('📍 Hostname:', window.location.hostname);
console.log('📝 Example: OTP endpoint will be:', `${API_URL}/otp/send`);
console.log('🔍 VITE_API_URL value:', import.meta.env.VITE_API_URL || 'NOT SET');
console.log('✅ Full OTP URL:', `${API_URL}/otp/send`);
console.log('✅ Full Verify URL:', `${API_URL}/otp/verify`);

// Helper function to wake up backend (for Render free tier)
// This pings the health endpoint to wake up sleeping backends
export const wakeUpBackend = async () => {
  try {
    const baseUrl = API_URL.replace('/api', '');
    const healthUrl = baseUrl.endsWith('/health') ? baseUrl : `${baseUrl}/health`;
    await axios.get(healthUrl, { timeout: 60000 });
    console.log('✅ Backend is awake');
    return true;
  } catch (error) {
    console.warn('⚠️ Backend wake-up check failed:', error.message);
    return false;
  }
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout (Render free tier can take 30-60s to wake up)
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log the full URL being called for debugging
  const fullUrl = config.baseURL + config.url;
  console.log(`🌐 Making request to: ${fullUrl}`);
  return config;
}, (error) => {
  console.error('[API] Request error:', error);
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    const fullUrl = error.config?.baseURL + error.config?.url;
    console.error('[API Error]', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: fullUrl
    });
    console.error(`❌ Failed request to: ${fullUrl}`);

    if (error.code === 'ECONNABORTED') {
      error.message = 'Backend is waking up (this may take up to 60 seconds). Please wait and try again.';
      error.isNetworkError = true;
      error.isBackendSleeping = true;
    } else if (error.message === 'Network Error' || !error.response) {
      error.message = 'Backend is waking up. Please wait a moment and try again.';
      error.isNetworkError = true;
      error.isBackendSleeping = true;
    } else if (error.response?.status === 404) {
      error.message = `Endpoint not found: ${error.config?.url}. Backend may be sleeping or route doesn't exist.`;
      error.isNetworkError = true;
    }
    return Promise.reject(error);
  }
);

export default api;
