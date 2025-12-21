const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // For storing additional data like order IDs, product IDs, etc.
  }
});

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  category: {
    type: String,
    enum: [
      'general',
      'order_tracking_support',
      'product_inquiry_support',
      'account_help_support',
      'shipping_info_support',
      'returns_support',
      'payments_support',
      'complaint_support',
      'technical_support_support',
      'inventory_support',
      'sales_support'
    ],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'closed'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  messages: [messageSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastMessageAt when messages are added
conversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastMessageAt = new Date();
    this.updatedAt = new Date();
  }
  next();
});

// Virtual for message count
conversationSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Virtual for last message
conversationSchema.virtual('lastMessage').get(function() {
  return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
});

// Index for better query performance
conversationSchema.index({ user: 1, updatedAt: -1 });
conversationSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
