const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

// Seller email
const SELLER_EMAIL = 'adithyananimon0@gmail.com';

const approveSellerProducts = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Find seller by email
    const seller = await User.findOne({ email: SELLER_EMAIL.toLowerCase() });
    
    if (!seller) {
      console.log(`❌ Seller with email ${SELLER_EMAIL} not found.`);
      process.exit(1);
    }
    
    console.log(`✅ Found seller: ${seller.name} (${seller.email})\n`);
    
    // Find all unapproved products for this seller
    const unapprovedProducts = await Product.find({
      seller: seller._id,
      isApproved: false
    });
    
    if (unapprovedProducts.length === 0) {
      console.log('✅ No unapproved products found for this seller.');
      process.exit(0);
    }
    
    console.log(`📦 Found ${unapprovedProducts.length} unapproved product(s)...\n`);
    
    // Approve all products
    const approvedProducts = [];
    for (const product of unapprovedProducts) {
      product.isApproved = true;
      product.approvedAt = new Date();
      // You can set approvedBy to an admin user ID if needed
      // product.approvedBy = adminUserId;
      
      await product.save();
      approvedProducts.push(product);
      
      console.log(`✅ Approved: ${product.name} (${product._id})`);
      console.log(`   Price: $${product.price} | Stock: ${product.countInStock}`);
    }
    
    console.log(`\n✅ Successfully approved ${approvedProducts.length} product(s) for seller ${seller.email}`);
    console.log(`   Products are now visible to users!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  approveSellerProducts();
}

module.exports = approveSellerProducts;

