const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
const User = require('./models/User');

// List all users and their roles
const listAllUsers = async () => {
  try {
    await connectDB();
    
    const users = await User.find({}).select('name email role isSellerApproved createdAt');
    
    console.log(`\n📋 Found ${users.length} user(s) in database:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Is Seller Approved: ${user.isSellerApproved}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Count by role
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Role Distribution:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });
    
    // Find users with seller role that might need to be changed
    const sellerUsers = users.filter(u => u.role === 'seller' && !u.isSellerApproved);
    if (sellerUsers.length > 0) {
      console.log(`\n⚠️  Found ${sellerUsers.length} user(s) with 'seller' role but not approved:`);
      sellerUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
      console.log('\n💡 These users might need their role changed to "user" if they should be regular users.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

listAllUsers();

