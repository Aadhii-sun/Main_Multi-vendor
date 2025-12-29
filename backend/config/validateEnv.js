/**
 * Environment variable validation
 * Validates all required and optional environment variables on startup
 */

const logger = require('./logger');

const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET'
];

const optionalEnvVars = [
  'CLIENT_URL',
  'STRIPE_SECRET_KEY',
  'SENDGRID_API_KEY',
  'EMAIL_USER',
  'EMAIL_PASS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'STRIPE_WEBHOOK_SECRET',
  'NODE_ENV',
  'PORT',
  'LOG_LEVEL'
];

const validateEnv = () => {
  const missing = [];
  const warnings = [];
  const info = {};

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      info[varName] = '✓ Set';
    }
  });

  // Check optional but recommended variables
  const recommended = ['CLIENT_URL', 'STRIPE_SECRET_KEY'];
  recommended.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    } else {
      info[varName] = '✓ Set';
    }
  });

  // Check optional variables
  optionalEnvVars.forEach(varName => {
    if (process.env[varName]) {
      info[varName] = '✓ Set';
    } else {
      info[varName] = '○ Not set (optional)';
    }
  });

  // Validate specific formats
  const validations = [];

  // JWT_SECRET should be at least 32 characters
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    validations.push({
      var: 'JWT_SECRET',
      issue: 'Should be at least 32 characters for security',
      severity: 'warning'
    });
  }

  // MONGO_URI should be a valid MongoDB connection string
  if (process.env.MONGO_URI && !process.env.MONGO_URI.startsWith('mongodb')) {
    validations.push({
      var: 'MONGO_URI',
      issue: 'Should be a valid MongoDB connection string',
      severity: 'error'
    });
  }

  // CLIENT_URL should be a valid URL
  if (process.env.CLIENT_URL) {
    try {
      new URL(process.env.CLIENT_URL);
    } catch (e) {
      validations.push({
        var: 'CLIENT_URL',
        issue: 'Should be a valid URL',
        severity: 'warning'
      });
    }
  }

  // Log results
  logger.info('Environment Variable Validation:', {
    required: {
      total: requiredEnvVars.length,
      set: requiredEnvVars.length - missing.length,
      missing
    },
    recommended: {
      total: recommended.length,
      set: recommended.length - warnings.length,
      missing: warnings
    },
    validations
  });

  // Log all environment variables status
  logger.debug('Environment Variables Status:', info);

  // Fail if required variables are missing
  if (missing.length > 0) {
    logger.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about recommended variables
  if (warnings.length > 0) {
    logger.warn('Recommended environment variables not set:', warnings);
  }

  // Warn about validation issues
  validations.forEach(validation => {
    if (validation.severity === 'error') {
      logger.error(`Environment variable validation error: ${validation.var} - ${validation.issue}`);
    } else {
      logger.warn(`Environment variable validation warning: ${validation.var} - ${validation.issue}`);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    warnings,
    validations
  };
};

module.exports = validateEnv;

