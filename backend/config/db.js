const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
      if (isDevelopment) {
        logger.warn('⚠️  MONGO_URI not set. Database connection skipped in development mode.');
        logger.warn('   Please set MONGO_URI in your .env file to enable database features.');
        return; // Don't crash, just skip connection
      } else {
        logger.error('❌ MONGO_URI is required in production');
        process.exit(1);
      }
    }
    
    logger.info('Attempting to connect to MongoDB...');
    
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    });
    
    logger.info(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    
    // Create indexes after connection
    try {
      const createIndexes = require('./indexes');
      await createIndexes();
    } catch (indexError) {
      logger.warn('Index creation warning (may already exist):', indexError.message);
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected');
    });
    
  } catch (error) {
    const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
    
    logger.error('\n❌ MongoDB Connection Failed!');
    logger.error('Error:', { message: error.message, name: error.name });
    
    if (error.message.includes('authentication')) {
      logger.error('⚠️  Authentication Error: Check your MongoDB username and password');
    } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      logger.error('⚠️  Connection Timeout: Check network access and MongoDB URI');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
      logger.error('⚠️  DNS Error: Check your MongoDB URI hostname');
    }
    
    logger.error('🔧 Troubleshooting Steps:');
    logger.error('1. Check MongoDB Atlas IP Whitelist');
    logger.error('2. Verify your cluster is running (not paused)');
    logger.error('3. Check MONGO_URI in environment variables');
    logger.error('4. Verify MongoDB URI format');
    logger.error('5. Ensure username/password are URL-encoded');
    
    // In development, warn but don't crash (allows server to start without DB)
    // In production, exit since DB is critical
    if (isDevelopment) {
      logger.warn('⚠️  Server will continue without database connection in development mode');
      logger.warn('   Some features will not work until MongoDB is connected');
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
