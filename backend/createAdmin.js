const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');

// Import User model
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'adithyaananimon9@gmail.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin._id);
      return existingAdmin._id;
    }
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'adithyaananimon9@gmail.com',
      password: 'Adi@123456789',
      isAdmin: true,
      isSeller: true,
      seller: {
        name: 'Admin Store',
        logo: '/images/logo.png',
        description: 'Administrator store',
        rating: 5,
        numReviews: 0
      }
    });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    
    // Save admin user
    const savedAdmin = await admin.save();
    console.log('✅ Admin user created successfully:', savedAdmin._id);
    
    return savedAdmin._id;
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
