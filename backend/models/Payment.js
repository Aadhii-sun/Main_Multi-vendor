const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  stripePaymentIntentId: { type: String, required: true, unique: true },
  stripeChargeId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card'],
      default: 'card'
    },
    last4: String,
    brand: String,
    country: String
  },
  receiptUrl: String,
  failureReason: String,
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
