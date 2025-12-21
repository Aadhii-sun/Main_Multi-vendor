const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
const User = require('./models/User');

// Fix all users that have 'seller' role but should be 'user'
// This will change any user with role='seller' and isSellerApproved=false to role='user'
const fixAllUserRoles = async () => {
  try {
    await connectDB();
    
    // Find all users with 'seller' role that are not approved
    const sellerUsers = await User.find({ 
      role: 'seller',
      isSellerApproved: false 
    });
    
    console.log(`\n📋 Found ${sellerUsers.length} user(s) with 'seller' role but not approved:\n`);
    
    if (sellerUsers.length === 0) {
      console.log('✅ No users need to be fixed.');
      process.exit(0);
    }
    
    let fixedCount = 0;
    
    for (const user of sellerUsers) {
      console.log(`   - ${user.name} (${user.email})`);
      console.log(`     Current: role='seller', isSellerApproved=false`);
      
      // Change to 'user' role
      user.role = 'user';
      user.isSellerApproved = false;
      await user.save();
      
      console.log(`     Fixed: role='user'`);
      fixedCount++;
      console.log('');
    }
    
    console.log(`\n✅ Fixed ${fixedCount} user(s). They can now login as regular users.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixAllUserRoles();

