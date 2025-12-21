const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

// Seller email
const SELLER_EMAIL = 'adithyananimon0@gmail.com';

// Products to add
const productsToAdd = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and professionals.',
    price: 79.99,
    originalPrice: 129.99,
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'SoundMax',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
    ],
    countInStock: 45,
    weight: 0.3,
    dimensions: { length: 20, width: 18, height: 8 },
    tags: ['wireless', 'bluetooth', 'noise-cancelling', 'audio'],
    featured: true,
    status: 'active'
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking watch with heart rate monitor, GPS, sleep tracking, and 7-day battery life. Water-resistant and compatible with iOS and Android.',
    price: 199.99,
    originalPrice: 249.99,
    category: 'Electronics',
    subcategory: 'Wearables',
    brand: 'FitTech',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500'
    ],
    countInStock: 32,
    weight: 0.05,
    dimensions: { length: 4, width: 4, height: 1.2 },
    tags: ['fitness', 'smartwatch', 'health', 'tracking'],
    featured: true,
    status: 'active'
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt. Soft, breathable fabric perfect for everyday wear. Available in multiple colors and sizes.',
    price: 24.99,
    originalPrice: 34.99,
    category: 'Clothing',
    subcategory: 'Tops',
    brand: 'EcoWear',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500'
    ],
    countInStock: 120,
    weight: 0.2,
    dimensions: { length: 30, width: 25, height: 2 },
    tags: ['organic', 'cotton', 'sustainable', 'casual'],
    featured: false,
    status: 'active'
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof, and eco-friendly. Perfect for gym, office, or travel.',
    price: 29.99,
    originalPrice: 39.99,
    category: 'Home & Garden',
    subcategory: 'Kitchen',
    brand: 'HydroLife',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500'
    ],
    countInStock: 78,
    weight: 0.4,
    dimensions: { length: 8, width: 8, height: 28 },
    tags: ['water-bottle', 'insulated', 'eco-friendly', 'bpa-free'],
    featured: false,
    status: 'active'
  },
  {
    name: 'Wireless Phone Charger',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator. Supports up to 15W fast charging.',
    price: 34.99,
    originalPrice: 49.99,
    category: 'Electronics',
    subcategory: 'Accessories',
    brand: 'ChargeTech',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500',
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c3?w=500'
    ],
    countInStock: 56,
    weight: 0.15,
    dimensions: { length: 10, width: 10, height: 0.8 },
    tags: ['wireless', 'charger', 'qi', 'fast-charging'],
    featured: false,
    status: 'active'
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Extra thick non-slip yoga mat with carrying strap. Made from eco-friendly TPE material. Perfect for yoga, pilates, and exercise routines.',
    price: 39.99,
    originalPrice: 59.99,
    category: 'Sports',
    subcategory: 'Fitness',
    brand: 'FlexFit',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500'
    ],
    countInStock: 65,
    weight: 1.2,
    dimensions: { length: 183, width: 61, height: 1 },
    tags: ['yoga', 'fitness', 'exercise', 'non-slip'],
    featured: false,
    status: 'active'
  },
  {
    name: 'LED Desk Lamp',
    description: 'Modern LED desk lamp with adjustable brightness and color temperature. USB charging port, touch control, and flexible gooseneck design. Perfect for work or study.',
    price: 49.99,
    originalPrice: 69.99,
    category: 'Home & Garden',
    subcategory: 'Lighting',
    brand: 'BrightHome',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'
    ],
    countInStock: 42,
    weight: 0.8,
    dimensions: { length: 35, width: 15, height: 50 },
    tags: ['led', 'desk-lamp', 'adjustable', 'usb'],
    featured: false,
    status: 'active'
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof portable Bluetooth speaker with 360-degree sound. 12-hour battery life, built-in microphone for hands-free calls. Perfect for outdoor adventures.',
    price: 59.99,
    originalPrice: 89.99,
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'SoundMax',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500'
    ],
    countInStock: 38,
    weight: 0.6,
    dimensions: { length: 18, width: 7, height: 7 },
    tags: ['bluetooth', 'speaker', 'portable', 'waterproof'],
    featured: true,
    status: 'active'
  },
  {
    name: 'Leather Wallet',
    description: 'Genuine leather wallet with RFID blocking technology. Multiple card slots, cash compartment, and ID window. Slim design fits comfortably in pocket.',
    price: 44.99,
    originalPrice: 64.99,
    category: 'Clothing',
    subcategory: 'Accessories',
    brand: 'LeatherCraft',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'
    ],
    countInStock: 89,
    weight: 0.1,
    dimensions: { length: 10, width: 7, height: 1.5 },
    tags: ['wallet', 'leather', 'rfid-blocking', 'accessories'],
    featured: false,
    status: 'active'
  },
  {
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 premium ceramic coffee mugs. Dishwasher and microwave safe. Elegant design perfect for home or office. Makes a great gift.',
    price: 19.99,
    originalPrice: 29.99,
    category: 'Home & Garden',
    subcategory: 'Kitchen',
    brand: 'HomeEssentials',
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=500'
    ],
    countInStock: 95,
    weight: 1.5,
    dimensions: { length: 25, width: 25, height: 10 },
    tags: ['coffee', 'mug', 'ceramic', 'kitchen'],
    featured: false,
    status: 'active'
  }
];

const addProductsForSeller = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Find seller by email
    const seller = await User.findOne({ email: SELLER_EMAIL.toLowerCase() });
    
    if (!seller) {
      console.log(`❌ Seller with email ${SELLER_EMAIL} not found.`);
      console.log('Creating seller account...');
      
      // Create seller account if it doesn't exist
      const newSeller = new User({
        name: 'Seller Account',
        email: SELLER_EMAIL.toLowerCase(),
        password: 'Seller@1234', // Default password - should be changed
        role: 'seller',
        isSellerApproved: true, // Auto-approve for convenience
      });
      
      await newSeller.save();
      console.log(`✅ Seller account created: ${newSeller._id}`);
      
      // Use the new seller
      seller = newSeller;
    } else {
      console.log(`✅ Found seller: ${seller.name} (${seller.email})`);
      
      // Ensure seller role
      if (seller.role !== 'seller') {
        seller.role = 'seller';
        seller.isSellerApproved = true;
        await seller.save();
        console.log('✅ Updated user to seller role');
      }
    }
    
    if (productsToAdd.length === 0) {
      console.log('⚠️  No products to add. Please add products to the productsToAdd array.');
      return;
    }
    
    console.log(`\n📦 Adding ${productsToAdd.length} product(s)...\n`);
    
    const createdProducts = [];
    
    for (const productData of productsToAdd) {
      try {
        // Generate SKU if not provided
        const sku = productData.sku || `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        
        const product = new Product({
          seller: seller._id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          originalPrice: productData.originalPrice,
          category: productData.category,
          subcategory: productData.subcategory,
          brand: productData.brand,
          images: productData.images || [],
          countInStock: productData.countInStock || 0,
          sku: sku,
          weight: productData.weight,
          dimensions: productData.dimensions,
          tags: productData.tags || [],
          featured: productData.featured || false,
          status: productData.status || 'active',
          isApproved: productData.isApproved !== undefined ? productData.isApproved : false, // Default to false, needs admin approval
        });
        
        const savedProduct = await product.save();
        createdProducts.push(savedProduct);
        
        console.log(`✅ Created: ${savedProduct.name} (${savedProduct._id})`);
        console.log(`   Price: $${savedProduct.price} | Stock: ${savedProduct.countInStock} | Approved: ${savedProduct.isApproved}`);
      } catch (error) {
        console.error(`❌ Failed to create product "${productData.name}":`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully created ${createdProducts.length} product(s) for seller ${seller.email}`);
    console.log(`⚠️  Note: Products need admin approval before they are visible to users.`);
    console.log(`   You can approve them from the admin dashboard.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  addProductsForSeller();
}

module.exports = addProductsForSeller;

