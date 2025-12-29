// Load environment configuration first
const config = require('./config/env');
const logger = require('./config/logger');
const validateEnv = require('./config/validateEnv');

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const sanitizeMiddleware = require('./middleware/sanitizeMiddleware');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const requestIdMiddleware = require('./middleware/requestId');
const Stripe = require("stripe");

logger.info('✅ Environment configuration loaded');
logger.info('Starting server...');
logger.info(`Environment: ${config.nodeEnv}`);
logger.info(`MongoDB URI: ${config.mongoUri ? 'Configured' : 'Missing'}`);
logger.info(`Email User: ${config.email.user ? 'Configured' : 'Missing'}`);

const app = express();

// Trust proxy - required for Render and rate limiting
app.set('trust proxy', 1);

// Request ID middleware (must be first)
app.use(requestIdMiddleware);

// Response compression
app.use(compression());

// Security middleware - configure helmet with enhanced security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Data sanitization against NoSQL injection (custom middleware for Express 5 compatibility)
app.use(sanitizeMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - MUST be before routes
const allowedOrigins = [
  config.clientUrl,
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://ego-store-frontend.onrender.com', // Production frontend - EXPLICITLY ADDED
  'https://ego-store-frontend.onrender.com/', // With trailing slash
  'http://ego-store-frontend.onrender.com', // HTTP variant (shouldn't happen but just in case)
].filter(Boolean);

// Remove duplicates and empty values, normalize URLs (remove trailing slashes)
const uniqueOrigins = [...new Set(allowedOrigins.map(url => url ? url.replace(/\/$/, '') : null).filter(Boolean))];

logger.info('🌐 CORS Configuration:', {
  environment: config.nodeEnv,
  allowedOrigins: uniqueOrigins
});

// CORS middleware - works for both development and production
app.use(cors({
  origin: function (origin, callback) {
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
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight OPTIONS requests explicitly (before other routes)
// CORS middleware already handles OPTIONS, but we add explicit handler for all API routes
app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204);
  }
  next();
});

// Stripe webhook endpoint (must be before JSON middleware)
// This route needs raw body, not parsed JSON
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./routes/paymentRoutes').webhookHandler);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (for debugging) - removed, now handled by timing middleware

// HTTP request logging with Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: logger.stream }));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Request timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      requestId: req.id,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  next();
});

// Initialize Stripe (only if key is available)
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    services: {
      database: 'unknown',
      stripe: 'unknown',
      email: 'unknown',
      cloudinary: 'unknown'
    }
  };

  try {
    // Check MongoDB connection
    const mongoose = require('mongoose');
    health.services.database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Stripe
    health.services.stripe = process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured';
    
    // Check Email
    health.services.email = (process.env.SENDGRID_API_KEY || (process.env.EMAIL_USER && process.env.EMAIL_PASS)) 
      ? 'configured' 
      : 'not_configured';
    
    // Check Cloudinary
    health.services.cloudinary = process.env.CLOUDINARY_API_SECRET ? 'configured' : 'not_configured';
    
    // Overall health status
    const allServicesHealthy = Object.values(health.services).every(
      status => status === 'connected' || status === 'configured'
    );
    
    if (!allServicesHealthy && health.services.database !== 'connected') {
      health.status = 'degraded';
      return res.status(503).json(health);
    }
    
    res.json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    health.status = 'unhealthy';
    health.error = error.message;
    res.status(503).json(health);
  }
});

// Test endpoint to verify API routing
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL,
    cors: {
      allowedOrigins: uniqueOrigins,
      origin: req.headers.origin || 'no origin header'
    }
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin || 'no origin header',
    allowedOrigins: uniqueOrigins,
    timestamp: new Date().toISOString()
  });
});

// Route listing endpoint (for debugging)
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: middleware.regexp.source + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({
    message: 'Registered routes',
    count: routes.length,
    routes: routes.filter(r => r.path.includes('otp') || r.path.includes('api'))
  });
});

// Routes
logger.info('📋 Registering API routes...');
app.use('/api/auth', require('./routes/authRoutes'));
logger.info('✅ Registered: /api/auth');

// OTP routes - verify mounting
try {
  const otpRoutes = require('./routes/otpRoutes');
  logger.debug('OTP routes module loaded:', { type: typeof otpRoutes });
  app.use('/api/otp', otpRoutes);
  logger.info('✅ Registered: /api/otp');
  logger.info('✅ OTP routes mounted successfully');
} catch (error) {
  logger.error('❌ ERROR: Failed to load OTP routes:', error);
  throw error;
}
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/sellers', require('./routes/sellerRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/test', require('./routes/connectionTestRoutes'));

// 404 handler for undefined API routes (must be after all other routes)
app.use('/api', (req, res) => {
  res.status(404).json({
    message: `API route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      '/api/auth/signin',
      '/api/auth/signup',
      '/api/otp/send',
      '/api/otp/verify',
      '/api/products',
      '/api/cart',
      '/api/orders',
      '/api/users'
    ]
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    // Listen on 0.0.0.0 to allow external connections (required for Render)
    app.listen(PORT, '0.0.0.0', () => {
      logger.info('='.repeat(50));
      logger.info('✅ Server started successfully!');
      logger.info('='.repeat(50));
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Port: ${PORT}`);
      logger.info(`Server URL: http://0.0.0.0:${PORT}`);
      logger.info(`Health check: http://0.0.0.0:${PORT}/health`);
      logger.info(`API test: http://0.0.0.0:${PORT}/api/test`);
      logger.info(`OTP test: http://0.0.0.0:${PORT}/api/otp/test`);
      logger.info('='.repeat(50));
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    logger.error('Error details:', { message: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();
