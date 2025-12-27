// Load environment configuration first
const config = require('./config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const Stripe = require("stripe");

console.log('✅ Environment configuration loaded');
console.log('Starting server...');
console.log('Environment:', config.nodeEnv);
console.log('MongoDB URI:', config.mongoUri ? 'Configured' : 'Missing');
console.log('Email User:', config.email.user ? 'Configured' : 'Missing');

const app = express();

// Trust proxy - required for Render and rate limiting
app.set('trust proxy', 1);

// Security middleware - configure helmet to work with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

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
  'https://ego-store-frontend.onrender.com' // Production frontend - EXPLICITLY ADDED
].filter(Boolean);

// Remove duplicates and empty values, normalize URLs (remove trailing slashes)
const uniqueOrigins = [...new Set(allowedOrigins.map(url => url ? url.replace(/\/$/, '') : null).filter(Boolean))];

console.log('🌐 CORS Configuration:');
console.log('   Environment:', config.nodeEnv);
console.log('   Allowed origins:', uniqueOrigins);

// CORS middleware - works for both development and production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin is in allowed list
    if (uniqueOrigins.includes(normalizedOrigin)) {
      console.log(`✅ CORS: Allowing origin: ${normalizedOrigin}`);
      return callback(null, true);
    }
    
    // In development, allow all localhost origins
    if (config.nodeEnv === 'development' && (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1'))) {
      console.log(`✅ CORS: Allowing localhost origin: ${normalizedOrigin}`);
      return callback(null, true);
    }
    
    // Log blocked origin for debugging
    console.log(`❌ CORS: Blocking origin: ${normalizedOrigin}`);
    console.log(`   Allowed origins: ${uniqueOrigins.join(', ')}`);
    console.log(`   CLIENT_URL env var: ${process.env.CLIENT_URL || 'NOT SET'}`);
    callback(new Error(`CORS blocked for origin: ${normalizedOrigin}. Allowed: ${uniqueOrigins.join(', ')}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Stripe webhook endpoint (must be before JSON middleware)
// This route needs raw body, not parsed JSON
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./routes/paymentRoutes').webhookHandler);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`📥 ${req.method} ${req.path}`, {
      query: req.query,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      contentType: req.headers['content-type']
    });
  }
  next();
});

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize Stripe (only if key is available)
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Test endpoint to verify API routing
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL
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
console.log('📋 Registering API routes...');
app.use('/api/auth', require('./routes/authRoutes'));
console.log('✅ Registered: /api/auth');

// OTP routes - verify mounting
try {
  const otpRoutes = require('./routes/otpRoutes');
  console.log('📦 OTP routes module loaded:', typeof otpRoutes);
  app.use('/api/otp', otpRoutes);
  console.log('✅ Registered: /api/otp');
  console.log('✅ OTP routes mounted successfully');
  // Log all registered OTP routes
  if (otpRoutes && otpRoutes.stack) {
    console.log('📋 OTP route stack:', otpRoutes.stack.map(layer => ({
      path: layer.route?.path,
      method: layer.route?.methods
    })));
  }
} catch (error) {
  console.error('❌ ERROR: Failed to load OTP routes:', error);
  console.error('❌ Error stack:', error.stack);
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
      console.log('='.repeat(50));
      console.log('✅ Server started successfully!');
      console.log('='.repeat(50));
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Port: ${PORT}`);
      console.log(`Server URL: http://0.0.0.0:${PORT}`);
      console.log(`Health check: http://0.0.0.0:${PORT}/health`);
      console.log(`API test: http://0.0.0.0:${PORT}/api/test`);
      console.log(`OTP test: http://0.0.0.0:${PORT}/api/otp/test`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
};

startServer();
