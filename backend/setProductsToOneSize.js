const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
const Product = require('./models/Product');

// Set all products to "One Size"
const setProductsToOneSize = async () => {
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
      // Initialize metadata if it doesn't exist
      if (!product.metadata) {
        product.metadata = {};
      }
      
      // Set size to "One Size"
      product.metadata.size = 'One Size';
      product.metadata.sizes = ['One Size']; // Also add as array for compatibility
      
      await product.save();
      updatedCount++;
      
      console.log(`✅ Updated: ${product.name}`);
      console.log(`   Size: One Size`);
      console.log('');
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} product(s)`);
    console.log(`   All products now have "One Size" in metadata.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

setProductsToOneSize();

