const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopName: { type: String, required: true },
  description: String,
  approved: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('SellerProfile', sellerProfileSchema);
