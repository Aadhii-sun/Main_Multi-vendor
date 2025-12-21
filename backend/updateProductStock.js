const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
const Product = require('./models/Product');

// Update all products to have 10 in stock
const updateProductStock = async () => {
  try {
    await connectDB();
    
    // Find all products
    const products = await Product.find({});
    
    console.log(`\n📦 Found ${products.length} product(s) in database\n`);
    
    if (products.length === 0) {
      console.log('⚠️  No products found in database.');
      process.exit(0);
    }
    
    let updatedCount = 0;
    
    for (const product of products) {
      const oldStock = product.countInStock;
      const oldStatus = product.status;
      
      // Update stock to 10
      product.countInStock = 10;
      
      // Set status to 'active' if it's not already
      if (product.status !== 'active') {
        product.status = 'active';
      }
      
      await product.save();
      updatedCount++;
      
      console.log(`✅ Updated: ${product.name}`);
      console.log(`   Stock: ${oldStock} → 10`);
      if (oldStatus !== 'active') {
        console.log(`   Status: ${oldStatus} → active`);
      }
      console.log('');
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} product(s)`);
    console.log(`   All products now have 10 in stock and are active.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateProductStock();

