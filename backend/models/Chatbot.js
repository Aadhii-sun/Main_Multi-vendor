const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    unique: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'orders', 'products', 'account', 'shipping', 'returns', 'payments'],
    required: true
  },
  keywords: [String], // For better matching
  priority: {
    type: Number,
    default: 1 // Higher priority FAQs shown first
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const chatbotConfigSchema = new mongoose.Schema({
  systemPrompt: {
    type: String,
    default: `You are a helpful customer service assistant for an e-commerce platform. You can help with:
    - Product information and recommendations
    - Order tracking and status
    - Account and login issues
    - Shipping and delivery questions
    - Returns and refunds
    - Payment problems
    - General shopping assistance

    Be friendly, professional, and concise. If you don't know something, say so and offer to escalate to human support.`
  },
  maxTokens: {
    type: Number,
    default: 150
  },
  temperature: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 1
  },
  welcomeMessage: {
    type: String,
    default: "Hi! I'm your virtual assistant. How can I help you today? You can ask me about products, orders, shipping, or any other questions!"
  },
  fallbackMessage: {
    type: String,
    default: "I'm not sure about that. Would you like me to connect you with a human support agent?"
  },
  businessHours: {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
    timezone: { type: String, default: 'UTC' }
  },
  autoResponses: [{
    trigger: String,
    response: String,
    category: String
  }]
}, {
  timestamps: true
});

module.exports = {
  FAQ: mongoose.model('FAQ', faqSchema),
  ChatbotConfig: mongoose.model('ChatbotConfig', chatbotConfigSchema)
};
