const xss = require('xss');

/**
 * XSS sanitization options
 */
const xssOptions = {
  whiteList: {
    // Allow basic HTML tags for rich text
    p: [],
    br: [],
    strong: [],
    em: [],
    u: [],
    ul: [],
    ol: [],
    li: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: []
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script']
};

/**
 * Sanitize string to prevent XSS attacks
 * @param {string} input - Input string to sanitize
 * @param {boolean} allowHtml - Whether to allow HTML tags (default: false)
 * @returns {string} Sanitized string
 */
const sanitize = (input, allowHtml = false) => {
  if (!input || typeof input !== 'string') {
    return input;
  }

  if (allowHtml) {
    return xss(input, xssOptions);
  }

  // Strip all HTML tags
  return xss(input, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
};

/**
 * Sanitize object recursively
 * @param {any} obj - Object to sanitize
 * @param {boolean} allowHtml - Whether to allow HTML tags
 * @returns {any} Sanitized object
 */
const sanitizeObject = (obj, allowHtml = false) => {
  if (typeof obj === 'string') {
    return sanitize(obj, allowHtml);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, allowHtml));
  }

  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key], allowHtml);
      }
    }
    return sanitized;
  }

  return obj;
};

module.exports = {
  sanitize,
  sanitizeObject
};

