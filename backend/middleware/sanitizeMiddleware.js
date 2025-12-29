/**
 * Custom sanitization middleware compatible with Express 5
 * Replaces express-mongo-sanitize which has Express 5 compatibility issues
 */

const logger = require('../config/logger');

/**
 * Sanitize object recursively to prevent NoSQL injection
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Remove MongoDB operators
    return obj.replace(/\$|\./g, '');
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Remove keys that start with $ (MongoDB operators)
        if (key.startsWith('$')) {
          logger.warn(`Blocked MongoDB operator in key: ${key}`);
          continue;
        }
        // Recursively sanitize value
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Sanitization middleware
 * Express 5 has read-only query/params, so we focus on body sanitization
 * Query and params are validated by Mongoose/validation middleware
 */
const sanitizeMiddleware = (req, res, next) => {
  try {
    // Sanitize request body (main attack vector for NoSQL injection)
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Log suspicious query parameters (but can't modify them in Express 5)
    if (req.query && typeof req.query === 'object') {
      for (const key in req.query) {
        if (Object.prototype.hasOwnProperty.call(req.query, key) && key.startsWith('$')) {
          logger.warn(`Suspicious MongoDB operator in query: ${key}`, {
            requestId: req.id,
            ip: req.ip,
            path: req.path
          });
        }
      }
    }

    // Log suspicious params
    if (req.params && typeof req.params === 'object') {
      for (const key in req.params) {
        if (Object.prototype.hasOwnProperty.call(req.params, key) && key.startsWith('$')) {
          logger.warn(`Suspicious MongoDB operator in params: ${key}`, {
            requestId: req.id,
            ip: req.ip,
            path: req.path
          });
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Sanitization middleware error:', error);
    // Continue even if sanitization fails - don't break the request
    next();
  }
};

module.exports = sanitizeMiddleware;

