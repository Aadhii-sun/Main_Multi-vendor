const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');

// Import Product model
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'Wireless Earbuds Pro',
    description: 'High-quality wireless earbuds with noise cancellation',
    price: 129.99,
    category: 'Electronics',
    brand: 'SoundMaster',
    countInStock: 50,
    image: '/images/earbuds.jpg',
    rating: 4.5,
    numReviews: 25,
  },
  {
    name: 'Smartphone X',
    description: 'Latest smartphone with advanced camera features',
    price: 899.99,
    category: 'Electronics',
    brand: 'TechGiant',
    countInStock: 30,
    image: '/images/phone.jpg',
    rating: 4.8,
    numReviews: 42,
  },
  {
    name: 'Running Shoes',
    description: 'Comfortable running shoes for all terrains',
    price: 89.99,
    category: 'Footwear',
    brand: 'RunFast',
    countInStock: 100,
    image: '/images/shoes.jpg',
    rating: 4.7,
    numReviews: 38,
  }
];

const addSampleData = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    
    console.log('Adding sample products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    
    console.log('✅ Sample products added successfully!');
    console.log('\nAdded Products:');
    createdProducts.forEach(product => {
      console.log(`- ${product.name} (${product._id})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample data:', error);
    process.exit(1);
  }
};

addSampleData();
