/**
 * Backend Host Configuration
 * Single source of truth for all backend URLs and connections
 * Change URLs here and they will be used throughout the application
 */

// ============================================
// ENVIRONMENT DETECTION
// ============================================
// Detect if running locally or on production
// Check for hosting platform environment variables first
const isHostingPlatform = !!(process.env.RENDER || process.env.VERCEL || process.env.HEROKU);
// If explicitly set to production on a hosting platform, use production URLs
// Otherwise, if NODE_ENV is not explicitly 'production' or we're not on a hosting platform, assume local
const isLocal = !isHostingPlatform || 
                process.env.NODE_ENV === 'development' ||
                process.env.BACKEND_HOST?.includes('localhost') ||
                process.env.BACKEND_HOST?.includes('127.0.0.1') ||
                (!process.env.NODE_ENV && !isHostingPlatform);

const defaultBackendHost = isLocal 
  ? `http://localhost:${process.env.PORT || 5000}`
  : 'https://ego-store-backend.onrender.com';

const defaultFrontendHost = isLocal
  ? 'http://localhost:5173'
  : 'https://ego-store-frontend.onrender.com';

// ============================================
// BACKEND HOST CONFIGURATION
// ============================================
// Change these URLs in ONE place - they will be used everywhere

const BACKEND_CONFIG = {
  // Backend Server URL (where this backend is hosted)
  host: process.env.BACKEND_HOST || process.env.BACKEND_URL || defaultBackendHost,
  
  // Frontend URL (for CORS and redirects)
  frontend: process.env.CLIENT_URL || process.env.FRONTEND_URL || defaultFrontendHost,
  
  // API Base Path
  apiPath: '/api',
  
  // Full API URL
  get apiUrl() {
    return `${this.host}${this.apiPath}`;
  },
  
  // Database Connection
  database: {
    uri: process.env.MONGO_URI,
  },
  
  // External Services
  services: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dkq9qo8vf',
      apiKey: process.env.CLOUDINARY_API_KEY || '799582919956526',
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get full backend URL
 */
const getBackendUrl = () => {
  return BACKEND_CONFIG.host;
};

/**
 * Get full API URL
 */
const getApiUrl = () => {
  return BACKEND_CONFIG.apiUrl;
};

/**
 * Get frontend URL
 */
const getFrontendUrl = () => {
  return BACKEND_CONFIG.frontend;
};

/**
 * Print configuration (for debugging)
 */
const printConfig = () => {
  console.log('\n📋 Backend Host Configuration:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Backend Host:     ${BACKEND_CONFIG.host}`);
  console.log(`API URL:          ${BACKEND_CONFIG.apiUrl}`);
  console.log(`Frontend URL:     ${BACKEND_CONFIG.frontend}`);
  console.log(`Server Port:      ${BACKEND_CONFIG.server.port}`);
  console.log(`Environment:      ${BACKEND_CONFIG.server.nodeEnv}`);
  console.log(`MongoDB:          ${BACKEND_CONFIG.database.uri ? '✅ Configured' : '❌ Missing'}`);
  console.log(`Stripe:           ${BACKEND_CONFIG.services.stripe.secretKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`Cloudinary:       ${BACKEND_CONFIG.services.cloudinary.apiSecret ? '✅ Configured' : '❌ Missing'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

module.exports = {
  BACKEND_CONFIG,
  getBackendUrl,
  getApiUrl,
  getFrontendUrl,
  printConfig,
};

