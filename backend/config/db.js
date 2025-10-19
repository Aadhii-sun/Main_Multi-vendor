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
    
    console.error('\n🔧 Troubleshooting Steps:');
    console.error('1. Check MongoDB Atlas IP Whitelist:');
    console.error('   - Go to: https://cloud.mongodb.com/');
    console.error('   - Navigate to: Network Access');
    console.error('   - Add your IP or use 0.0.0.0/0 for testing (allow all)');
    console.error('\n2. Verify your cluster is running (not paused)');
    console.error('3. Check username/password in .env file');
    console.error('4. Ensure stable internet connection\n');
    
    process.exit(1);
  }
};

module.exports = connectDB;
