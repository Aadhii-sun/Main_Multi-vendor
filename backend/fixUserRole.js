const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
const User = require('./models/User');

// Fix user role by email
const fixUserRole = async (email, newRole = 'user') => {
  try {
    await connectDB();
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      process.exit(1);
    }
    
    console.log(`\n📋 Current User Info:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Is Seller Approved: ${user.isSellerApproved}`);
    
    // Only fix if role is 'seller' and user wants it to be 'user'
    if (user.role === 'seller' && newRole === 'user') {
      user.role = 'user';
      user.isSellerApproved = false;
      await user.save();
      console.log(`\n✅ Fixed! User role changed from 'seller' to 'user'`);
    } else if (user.role !== newRole) {
      user.role = newRole;
      if (newRole === 'user') {
        user.isSellerApproved = false;
      }
      await user.save();
      console.log(`\n✅ Fixed! User role changed to '${newRole}'`);
    } else {
      console.log(`\n✅ User role is already '${newRole}'. No changes needed.`);
    }
    
    console.log(`\n📋 Updated User Info:`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Is Seller Approved: ${user.isSellerApproved}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Get email and role from command line arguments
const email = process.argv[2];
const newRole = process.argv[3] || 'user';

if (!email) {
  console.log('Usage: node fixUserRole.js <email> [newRole]');
  console.log('Example: node fixUserRole.js user@example.com user');
  console.log('Roles: user, seller, admin');
  process.exit(1);
}

if (!['user', 'seller', 'admin'].includes(newRole)) {
  console.log('❌ Invalid role. Must be: user, seller, or admin');
  process.exit(1);
}

fixUserRole(email, newRole);

