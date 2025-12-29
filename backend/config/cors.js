/**
 * CORS Configuration
 * Centralized CORS settings for the application
 */

const logger = require('./logger');
const config = require('./env');
const { BACKEND_CONFIG } = require('./backendHost');

/**
 * Get allowed origins based on environment
 */
const getAllowedOrigins = () => {
  const allowedOrigins = [
    BACKEND_CONFIG.frontend, // Use centralized config
    config.clientUrl,
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://ego-store-frontend.onrender.com', // Production frontend
    'https://ego-store-frontend.onrender.com/', // With trailing slash
    'http://ego-store-frontend.onrender.com', // HTTP variant
  ].filter(Boolean);

  // Remove duplicates and normalize URLs (remove trailing slashes)
  const uniqueOrigins = [...new Set(allowedOrigins.map(url => url ? url.replace(/\/$/, '') : null).filter(Boolean))];

  return uniqueOrigins;
};

/**
 * CORS origin validation function
 */
const corsOriginHandler = (origin, callback) => {
  const uniqueOrigins = getAllowedOrigins();

  // Allow requests with no origin (like mobile apps, Postman, or curl requests)
  if (!origin) {
    logger.debug('CORS: Allowing request with no origin');
    return callback(null, true);
  }

  // Normalize origin (remove trailing slash and protocol variations)
  const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();

  // Normalize allowed origins for comparison
  const normalizedAllowed = uniqueOrigins.map(url => url.toLowerCase());

  // Check if origin is in allowed list (case-insensitive)
  if (normalizedAllowed.includes(normalizedOrigin)) {
    logger.debug(`CORS: Allowing origin: ${origin}`);
    return callback(null, true);
  }

  // In development, allow all localhost origins
  if (config.nodeEnv === 'development' && (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1'))) {
    logger.debug(`CORS: Allowing localhost origin: ${origin}`);
    return callback(null, true);
  }

  // In production, be more permissive for Render.com domains
  if (config.nodeEnv === 'production' && normalizedOrigin.includes('onrender.com')) {
    logger.debug(`CORS: Allowing Render.com origin: ${origin}`);
    return callback(null, true);
  }

  // Log blocked origin for debugging
  logger.warn(`CORS: Blocking origin: ${origin}`, {
    normalized: normalizedOrigin,
    allowedOrigins: uniqueOrigins,
    clientUrl: process.env.CLIENT_URL || 'NOT SET'
  });
  
  callback(new Error(`CORS blocked for origin: ${origin}. Allowed: ${uniqueOrigins.join(', ')}`));
};

/**
 * CORS configuration object
 */
const corsConfig = {
  origin: corsOriginHandler,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Request-ID'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

/**
 * Log CORS configuration on startup
 */
const logCorsConfig = () => {
  const uniqueOrigins = getAllowedOrigins();
  logger.info('🌐 CORS Configuration:', {
    environment: config.nodeEnv,
    allowedOrigins: uniqueOrigins,
    clientUrl: process.env.CLIENT_URL || 'NOT SET'
  });
};

module.exports = {
  corsConfig,
  getAllowedOrigins,
  logCorsConfig
};

