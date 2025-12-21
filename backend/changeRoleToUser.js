const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
const User = require('./models/User');

// Change user role to 'user' by email
const changeRoleToUser = async (email) => {
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
    
    // Change to 'user' role
    user.role = 'user';
    user.isSellerApproved = false;
    await user.save();
    
    console.log(`\n✅ Changed user role from '${user.role}' to 'user'`);
    console.log(`   Set isSellerApproved to false`);
    
    console.log(`\n📋 Updated User Info:`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Is Seller Approved: ${user.isSellerApproved}`);
    
    console.log(`\n⚠️  Note: This user can no longer access seller features.`);
    console.log(`   If they need seller access, they can register as a seller separately.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node changeRoleToUser.js <email>');
  console.log('Example: node changeRoleToUser.js user@example.com');
  process.exit(1);
}

changeRoleToUser(email);

