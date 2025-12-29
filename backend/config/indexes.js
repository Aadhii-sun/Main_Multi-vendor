/**
 * Database Index Configuration
 * Optimizes query performance for common operations
 */

const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Create database indexes for optimal performance
 */
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      logger.warn('Database not connected, skipping index creation');
      return;
    }

    logger.info('Creating database indexes...');

    // User indexes
    await mongoose.connection.collection('users').createIndexes([
      { key: { email: 1 }, unique: true, name: 'email_unique' },
      { key: { role: 1 }, name: 'role_index' },
      { key: { 'sellerProfile': 1 }, name: 'sellerProfile_index' }
    ]);

    // Product indexes
    await mongoose.connection.collection('products').createIndexes([
      { key: { name: 'text', description: 'text', tags: 'text', brand: 'text', category: 'text' }, name: 'text_search' },
      { key: { seller: 1 }, name: 'seller_index' },
      { key: { category: 1 }, name: 'category_index' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { featured: 1 }, name: 'featured_index' },
      { key: { price: 1 }, name: 'price_index' },
      { key: { averageRating: -1 }, name: 'rating_index' },
      { key: { createdAt: -1 }, name: 'createdAt_index' },
      { key: { seller: 1, status: 1 }, name: 'seller_status_compound' },
      { key: { category: 1, status: 1, price: 1 }, name: 'category_status_price_compound' }
    ]);

    // Order indexes
    await mongoose.connection.collection('orders').createIndexes([
      { key: { user: 1 }, name: 'user_index' },
      { key: { status: 1 }, name: 'order_status_index' },
      { key: { createdAt: -1 }, name: 'order_createdAt_index' },
      { key: { user: 1, status: 1 }, name: 'user_status_compound' },
      { key: { 'subOrders.seller': 1 }, name: 'subOrders_seller_index' }
    ]);

    // Cart indexes
    await mongoose.connection.collection('carts').createIndexes([
      { key: { user: 1 }, unique: true, name: 'user_unique' },
      { key: { 'items.product': 1 }, name: 'items_product_index' }
    ]);

    // Wishlist indexes
    await mongoose.connection.collection('wishlists').createIndexes([
      { key: { user: 1 }, unique: true, name: 'user_unique' },
      { key: { 'items.product': 1 }, name: 'items_product_index' }
    ]);

    // Payment indexes
    await mongoose.connection.collection('payments').createIndexes([
      { key: { user: 1 }, name: 'user_index' },
      { key: { order: 1 }, name: 'order_index' },
      { key: { stripePaymentIntentId: 1 }, unique: true, name: 'stripePaymentIntentId_unique' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { createdAt: -1 }, name: 'createdAt_index' }
    ]);

    // Coupon indexes
    await mongoose.connection.collection('coupons').createIndexes([
      { key: { code: 1 }, unique: true, name: 'code_unique' },
      { key: { isActive: 1, startDate: 1, endDate: 1 }, name: 'active_dates_index' }
    ]);

    logger.info('✅ Database indexes created successfully');
  } catch (error) {
    logger.error('Error creating database indexes:', error);
    // Don't throw - indexes might already exist
  }
};

module.exports = createIndexes;

