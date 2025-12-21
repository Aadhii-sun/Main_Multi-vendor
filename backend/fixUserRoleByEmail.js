const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
const User = require('./models/User');

// Fix user role by email - force to 'user' if not admin or approved seller
const fixUserRoleByEmail = async (email) => {
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
    
    // If user is not admin and not an approved seller, set to 'user'
    if (user.role !== 'admin' && !(user.role === 'seller' && user.isSellerApproved)) {
      if (user.role === 'seller' && !user.isSellerApproved) {
        console.log(`\n⚠️  User has 'seller' role but is not approved. Changing to 'user'...`);
        user.role = 'user';
        user.isSellerApproved = false;
        await user.save();
        console.log(`✅ Fixed! User role changed from 'seller' to 'user'`);
      } else if (user.role !== 'user') {
        console.log(`\n⚠️  User has unexpected role '${user.role}'. Changing to 'user'...`);
        user.role = 'user';
        await user.save();
        console.log(`✅ Fixed! User role changed to 'user'`);
      } else {
        console.log(`\n✅ User role is already 'user'. No changes needed.`);
      }
    } else {
      console.log(`\n✅ User role is correct (${user.role}). No changes needed.`);
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

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node fixUserRoleByEmail.js <email>');
  console.log('Example: node fixUserRoleByEmail.js user@example.com');
  process.exit(1);
}

fixUserRoleByEmail(email);

