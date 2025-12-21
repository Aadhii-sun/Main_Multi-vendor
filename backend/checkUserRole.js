const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
const User = require('./models/User');

// Check user role by email
const checkUserRole = async (email) => {
  try {
    await connectDB();
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      process.exit(1);
    }
    
    console.log(`\n✅ User found:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Is Seller Approved: ${user.isSellerApproved}`);
    console.log(`   Is Active: ${user.isActive}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`   Updated: ${user.updatedAt}`);
    
    // If role is 'seller' but user wants it to be 'user', offer to fix
    if (user.role === 'seller' && !user.isSellerApproved) {
      console.log(`\n⚠️  Warning: User has role 'seller' but is not approved.`);
      console.log(`   This might cause redirect issues.`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node checkUserRole.js <email>');
  console.log('Example: node checkUserRole.js user@example.com');
  process.exit(1);
}

checkUserRole(email);

