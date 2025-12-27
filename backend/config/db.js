const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    });
    
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    console.error('Error name:', error.name);
    
    if (error.message.includes('authentication')) {
      console.error('\n⚠️  Authentication Error: Check your MongoDB username and password');
    } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  Connection Timeout: Check network access and MongoDB URI');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
      console.error('\n⚠️  DNS Error: Check your MongoDB URI hostname');
    }
    
    console.error('\n🔧 Troubleshooting Steps:');
    console.error('1. Check MongoDB Atlas IP Whitelist:');
    console.error('   - Go to: https://cloud.mongodb.com/');
    console.error('   - Navigate to: Network Access');
    console.error('   - Add Render IPs or use 0.0.0.0/0 (allow all)');
    console.error('\n2. Verify your cluster is running (not paused)');
    console.error('3. Check MONGO_URI in Render environment variables');
    console.error('4. Verify MongoDB URI format: mongodb+srv://username:password@cluster.mongodb.net/dbname');
    console.error('5. Ensure username/password are URL-encoded if they contain special characters\n');
    
    process.exit(1);
  }
};

module.exports = connectDB;
