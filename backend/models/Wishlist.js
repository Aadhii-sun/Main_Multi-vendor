const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  price: {
    type: Number,
    required: true
  }, // Store price when added to wishlist
  availability: {
    type: Boolean,
    default: true
  } // Track if product is still available
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [wishlistItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update totals when items change
wishlistSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  this.updatedAt = Date.now();

  // Update availability status for each item
  this.items.forEach(item => {
    // In a real implementation, you'd check product availability here
    // For now, we'll assume items are available unless marked otherwise
    if (item.availability === undefined) {
      item.availability = true;
    }
  });

  next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
