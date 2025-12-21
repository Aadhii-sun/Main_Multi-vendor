const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed_amount', 'free_shipping', 'buy_one_get_one']
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumAmount: {
    type: Number,
    default: 0
  }, // Minimum order amount to use coupon
  maximumDiscount: {
    type: Number
  }, // Maximum discount amount for percentage coupons
  usageLimit: {
    type: Number
  }, // Total number of times coupon can be used
  usageCount: {
    type: Number,
    default: 0
  },
  userLimit: {
    type: Number,
    default: 1
  }, // Times per user
  applicableCategories: [String], // Categories where coupon applies
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }], // Specific products where coupon applies
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }], // Products where coupon doesn't apply
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ applicableCategories: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
