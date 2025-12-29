const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with request context
  logger.error('Error occurred', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    },
    user: req.user ? req.user._id : 'anonymous',
    ip: req.ip
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    error = { message: err.message, statusCode: 403 };
  }

  const statusCode = error.statusCode || res.statusCode || 500;
  const message = error.message || 'Server Error';

  // Don't expose stack trace in production
  const response = {
    success: false,
    message,
    requestId: req.id,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: {
        name: err.name,
        code: err.code
      }
    })
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
