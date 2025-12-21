const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
const User = require('./models/User');

const createSpecificAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    
    const adminEmail = 'adithyaananimon9@gmail.com';
    const adminPassword = 'Adi@123456789'; // Default password - should be changed
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update to ensure it's an admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin:', existingAdmin._id);
      } else {
        console.log('✅ Admin user already exists:', existingAdmin._id);
      }
      return existingAdmin._id;
    }
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isSellerApproved: true,
      isActive: true
    });
    
    // Password will be hashed by pre-save hook
    await admin.save();
    
    console.log('✅ Admin user created successfully:', admin._id);
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Default Password:', adminPassword);
    console.log('⚠️  Please change the password after first login!');
    
    return admin._id;
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  createSpecificAdmin()
    .then(() => {
      console.log('✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = createSpecificAdmin;

