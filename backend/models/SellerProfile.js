const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  shopName: { type: String, required: true },
  description: String,
  logo: String, // Store logo image URL
  banner: String, // Store banner image URL
  contactEmail: String,
  contactPhone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  socialMedia: {
    website: String,
    facebook: String,
    instagram: String,
    twitter: String
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalProducts: { type: Number, default: 0 },
  approved: { type: Boolean, default: false },
  verified: { type: Boolean, default: false }, // Verified vendor badge
  joinedDate: { type: Date, default: Date.now },
}, {
  timestamps: true
});

module.exports = mongoose.model('SellerProfile', sellerProfileSchema);
