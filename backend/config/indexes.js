/**
 * Database Index Configuration
 * Optimizes query performance for common operations
 */

const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Create database indexes for optimal performance
 * Handles existing indexes gracefully
 */
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      logger.warn('Database not connected, skipping index creation');
      return;
    }

    logger.info('Creating database indexes...');

    // Helper function to create index safely
    const createIndexSafely = async (collection, indexSpec) => {
      try {
        const collectionObj = mongoose.connection.collection(collection);
        // Check if index already exists
        const existingIndexes = await collectionObj.indexes();
        const indexKey = JSON.stringify(indexSpec.key);
        const indexExists = existingIndexes.some(idx => 
          JSON.stringify(idx.key) === indexKey
        );
        
        if (!indexExists) {
          await collectionObj.createIndex(indexSpec.key, {
            unique: indexSpec.unique || false,
            name: indexSpec.name,
            background: true
          });
          logger.debug(`Created index: ${collection}.${indexSpec.name}`);
        } else {
          logger.debug(`Index already exists: ${collection}.${indexSpec.name || 'unnamed'}`);
        }
      } catch (error) {
        // Ignore duplicate index errors
        if (error.code === 85 || error.codeName === 'IndexOptionsConflict' || error.message.includes('already exists')) {
          logger.debug(`Index conflict (already exists): ${collection}.${indexSpec.name || 'unnamed'}`);
        } else {
          logger.warn(`Error creating index ${collection}.${indexSpec.name}:`, error.message);
        }
      }
    };

    // User indexes (skip email - already created by unique: true in schema)
    await createIndexSafely('users', { key: { role: 1 }, name: 'role_index' });
    await createIndexSafely('users', { key: { 'sellerProfile': 1 }, name: 'sellerProfile_index' });

    // Product indexes
    try {
      await createIndexSafely('products', { 
        key: { name: 'text', description: 'text', tags: 'text', brand: 'text', category: 'text' }, 
        name: 'text_search' 
      });
    } catch (e) {
      logger.debug('Text index may already exist or not supported');
    }
    await createIndexSafely('products', { key: { seller: 1 }, name: 'seller_index' });
    await createIndexSafely('products', { key: { category: 1 }, name: 'category_index' });
    await createIndexSafely('products', { key: { status: 1 }, name: 'status_index' });
    await createIndexSafely('products', { key: { featured: 1 }, name: 'featured_index' });
    await createIndexSafely('products', { key: { price: 1 }, name: 'price_index' });
    await createIndexSafely('products', { key: { averageRating: -1 }, name: 'rating_index' });
    await createIndexSafely('products', { key: { createdAt: -1 }, name: 'createdAt_index' });
    await createIndexSafely('products', { key: { seller: 1, status: 1 }, name: 'seller_status_compound' });
    await createIndexSafely('products', { key: { category: 1, status: 1, price: 1 }, name: 'category_status_price_compound' });

    // Order indexes
    await createIndexSafely('orders', { key: { user: 1 }, name: 'user_index' });
    await createIndexSafely('orders', { key: { status: 1 }, name: 'order_status_index' });
    await createIndexSafely('orders', { key: { createdAt: -1 }, name: 'order_createdAt_index' });
    await createIndexSafely('orders', { key: { user: 1, status: 1 }, name: 'user_status_compound' });
    await createIndexSafely('orders', { key: { 'subOrders.seller': 1 }, name: 'subOrders_seller_index' });

    // Cart indexes
    await createIndexSafely('carts', { key: { user: 1 }, unique: true, name: 'user_unique' });
    await createIndexSafely('carts', { key: { 'items.product': 1 }, name: 'items_product_index' });

    // Wishlist indexes
    await createIndexSafely('wishlists', { key: { user: 1 }, unique: true, name: 'user_unique' });
    await createIndexSafely('wishlists', { key: { 'items.product': 1 }, name: 'items_product_index' });

    // Payment indexes
    await createIndexSafely('payments', { key: { user: 1 }, name: 'user_index' });
    await createIndexSafely('payments', { key: { order: 1 }, name: 'order_index' });
    await createIndexSafely('payments', { key: { stripePaymentIntentId: 1 }, unique: true, name: 'stripePaymentIntentId_unique' });
    await createIndexSafely('payments', { key: { status: 1 }, name: 'status_index' });
    await createIndexSafely('payments', { key: { createdAt: -1 }, name: 'createdAt_index' });

    // Coupon indexes (skip code - already created by unique: true in schema)
    await createIndexSafely('coupons', { key: { isActive: 1, startDate: 1, endDate: 1 }, name: 'active_dates_index' });

    logger.info('✅ Database indexes check completed');
  } catch (error) {
    logger.warn('Index creation warning (some indexes may already exist):', error.message);
    // Don't throw - indexes might already exist, this is not critical
  }
};

module.exports = createIndexes;

