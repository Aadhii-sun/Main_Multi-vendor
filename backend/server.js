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

// Routes
console.log('📋 Registering API routes...');
app.use('/api/auth', require('./routes/authRoutes'));
console.log('✅ Registered: /api/auth');
app.use('/api/otp', require('./routes/otpRoutes'));
console.log('✅ Registered: /api/otp');
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
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
