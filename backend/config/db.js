const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
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
    
    process.exit(1);
  }
};

module.exports = connectDB;
