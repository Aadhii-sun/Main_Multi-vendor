const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  images: [String], // Review images
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  }, // For showing discounts
  category: {
    type: String,
    required: true,
    enum: [
      'Electronics',
      'Clothing',
      'Home & Garden',
      'Books',
      'Sports',
      'Beauty',
      'Automotive',
      'Toys',
      'Health',
      'Other'
    ]
  },
  subcategory: String,
  brand: String,
  images: [String], // Array of image URLs
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  }, // Stock Keeping Unit
  weight: Number, // For shipping calculations
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: [String], // For search and filtering
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  isApproved: {
    type: Boolean,
    default: true
  }, // Auto-approved - no admin approval needed
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  salesCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  } // For additional product data
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for search performance
productSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  brand: 'text',
  category: 'text'
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for availability status
productSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.countInStock > 0;
});

// Virtual for low stock warning
productSchema.virtual('isLowStock').get(function() {
  return this.countInStock <= this.lowStockThreshold && this.countInStock > 0;
});

// Update average rating when reviews are added/updated
productSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    this.averageRating = this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
    this.reviewCount = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
