const { FAQ, ChatbotConfig } = require('../models/Chatbot');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

class BuiltInChatbotService {
  constructor() {
    this.responseCategories = {
      // General responses for all users
      general: {
        greeting: [
          "Hello! Welcome to our e-commerce platform. How can I help you today?",
          "Hi there! I'm here to assist you with any questions you might have.",
          "Welcome! What can I help you with today?",
          "Hey! Glad you're here. Ask me anything about shopping, orders, or selling on our marketplace.",
          "Hello and welcome back! Ready to explore, manage orders, or check your store?"
        ],
        goodbye: [
          "Thank you for chatting with me! Have a great day!",
          "It was nice helping you! Feel free to reach out anytime.",
          "Goodbye! Don't hesitate to contact us if you need anything else.",
          "Take care! I'm always here if you have more questions about our marketplace.",
          "Thanks for stopping by! Good luck with your shopping or sales today."
        ],
        fallback: [
          "I'm not sure about that specific question, but I'm happy to find the right person to help. Would you like me to connect you with support?",
          "I don't have information about that right now. You can ask me about orders, products, shipping, or account help in the meantime!",
          "That's outside my current knowledge, but I can escalate this to our customer support team. Would you like to continue with that?",
          "I may not have that answer yet, but I'm still learning. Try asking about your orders, cart, returns, vendor onboarding, or account settings.",
          "Hmm, I'm not confident about that one. Could you rephrase it or ask about products, deliveries, payouts, or seller tools?"
        ]
      },

      // User-specific responses (shoppers)
      user: {
        products: [
          "I can help you find products! What type of items are you looking for?",
          "We have a wide variety of products from multiple vendors. Are you looking for something specific?",
          "I'd be happy to help you browse our product catalog!",
          "Our sellers list new items every day. Tell me what you need and I'll point you in the right direction.",
          "Looking for something curated from a particular seller? Let me know the category or brand."
        ],
        orders: [
          "I can help you track your orders or check order status. Do you have an order number?",
          "Let me help you with your order. Can you provide your order number or email?",
          "I can assist with order inquiries. What would you like to know about your order?",
          "Need help with marketplace orders from different sellers? Share the order number and I'll look it up.",
          "Want to combine shipments from multiple sellers? I can explain how the process works."
        ],
        cart: [
          "I can help you with your shopping cart! Would you like to add items, check prices, or proceed to checkout?",
          "Your shopping cart is ready for review. What would you like to do?",
          "Let me assist you with your cart. Do you need help adding or removing items?",
          "You can keep items from different sellers in the same cart. Need help comparing shipping options?",
          "Want to apply coupons or split payments between seller items? I can guide you step by step."
        ],
        shipping: [
          "We offer various shipping options. Standard delivery takes 3-5 business days, and express delivery is available for faster service.",
          "Our shipping rates depend on your location and order value. Free shipping is available for orders over $50!",
          "We partner with reliable shipping carriers to ensure your orders arrive safely and on time.",
          "Each seller can choose their preferred carrier. I can help you compare delivery times across sellers.",
          "Need consolidated shipping? Some sellers support combined packaging—ask me how to enable it."
        ],
        returns: [
          "We have a 30-day return policy. Items must be in original condition with tags attached.",
          "Returns are accepted within 30 days of delivery. We'll process your refund within 5-7 business days after receiving the item.",
          "For returns, please ensure the item is unused and in its original packaging. Return shipping is free for defective items.",
          "Bought from different sellers? I can show you how to initiate multiple return requests in one go.",
          "Need store credit instead of a refund? Let me explain how each seller handles return preferences."
        ],
        account: [
          "I can help you with account-related questions like login issues, password resets, or profile updates.",
          "For account assistance, I can guide you through login, registration, or profile management.",
          "Account help is available! Are you having trouble logging in, need to reset your password, or update your information?",
          "Need to follow your favourite sellers or manage marketplace notifications? I can show you where to find those settings.",
          "Want to upgrade to a seller account or manage saved addresses? Just let me know."
        ],
        payments: [
          "You can pay with cards, wallets, or split payments between sellers. Need help choosing an option?",
          "I can guide you through using promo codes, wallet balance, or installment plans during checkout.",
          "For marketplace security, we hold payments in escrow until the seller confirms shipment. Want more details?"
        ],
        support: [
          "Need help from a seller directly? I can show you how to message them from your order details page.",
          "Our community forum is a great place to ask other shoppers. Want the link?",
          "If you prefer speaking to a support agent, I can generate a ticket with your chat transcript." 
        ]
      },

      // Seller-specific responses (vendors)
      seller: {
        products: [
          "I can help you manage your product listings, inventory, and sales performance.",
          "For sellers, I can assist with product uploads, inventory management, and sales analytics.",
          "Let me help you with your seller dashboard. Are you looking to add products, update listings, or check sales?",
          "Want to bulk upload SKUs or sync from another store? I can walk you through the supported formats.",
          "We support vendor-branded storefronts. Curious about customizing yours?"
        ],
        orders: [
          "I can help you manage your orders, update order status, and handle fulfillment.",
          "For order management, I can assist with status updates, shipping information, and customer communication.",
          "Let me help you with order processing. Do you need to update order status, print shipping labels, or handle returns?",
          "Need to schedule pickups with different carriers? I can explain how to link your shipping accounts.",
          "Want to enable partial fulfillment or split orders across warehouses? I can guide you through the settings."
        ],
        inventory: [
          "I can help you manage your inventory levels, stock alerts, and product availability.",
          "For inventory management, I can assist with stock updates, low stock alerts, and bulk inventory operations.",
          "Let me help you with inventory. Do you need to update stock levels, set up alerts, or manage product variants?",
          "We can sync your inventory with other marketplaces via API. Interested in setting that up?",
          "Want to enable dropshipping or supplier feeds? I can explain the options."
        ],
        sales: [
          "I can provide insights into your sales performance, top products, and revenue trends.",
          "For sales analytics, I can help you understand your performance metrics and growth opportunities.",
          "Let me assist with sales reporting. Would you like to see daily sales, top products, or customer analytics?",
          "Curious about conversion rates from your storefront? I can show you where to view them.",
          "Want to set up automatic promotions across your catalog? I can help configure campaign rules."
        ],
        account: [
          "I can help with your seller account, including profile updates, payment settings, and verification status.",
          "For seller account assistance, I can guide you through profile management and business settings.",
          "Seller account help is available! Need help with payments, verification, or account settings?",
          "Need to add staff members or manage roles for your team? I can show you how to invite them.",
          "Want faster payouts? I can explain the steps to complete verification and qualify for express disbursement."
        ],
        payouts: [
          "I can explain the payout schedule, fees, and how escrow releases work for each order.",
          "Need to connect a new bank account or enable split payouts? I can guide you through the finance tab.",
          "Want insights into your pending balance versus available balance? I can break it down for you."
        ],
        onboarding: [
          "Getting started as a seller? I can walk you through verification, catalog setup, and your first listing.",
          "We offer a sandbox environment for bulk uploads. Interested in testing before going live?",
          "Need our seller playbook or video tutorials? I can send you the onboarding kit."
        ],
        marketing: [
          "I can help you set up coupons, marketplace ads, and featured product slots.",
          "Want to create bundles or volume discounts? I can show you the merchandising tools.",
          "Looking to join seasonal campaigns? I can connect you with the category manager or provide the signup form."
        ]
      }
    };

    this.intentKeywords = {
      order_tracking: ['track', 'tracking', 'order status', 'where is my order', 'order number', 'delivery'],
      product_inquiry: ['product', 'item', 'buy', 'price', 'available', 'stock', 'specifications'],
      account_help: ['account', 'login', 'password', 'profile', 'sign in', 'register', 'forgot password'],
      shipping_info: ['shipping', 'delivery', 'ship', 'send', 'transport', 'courier'],
      returns: ['return', 'refund', 'exchange', 'cancel', 'policy', 'money back'],
      payments: ['payment', 'pay', 'card', 'billing', 'invoice', 'charge', 'payout', 'disbursement'],
      complaint: ['problem', 'issue', 'wrong', 'error', 'broken', 'damaged', 'complaint'],
      technical_support: ['website', 'app', 'technical', 'bug', 'error', 'not working', 'loading'],
      inventory: ['inventory', 'stock', 'product listing', 'add product', 'update product'],
      sales: ['sales', 'revenue', 'analytics', 'performance', 'promotion', 'campaign'],
      onboarding: ['onboard', 'verification', 'register as seller', 'become seller', 'store setup'],
      marketing: ['coupon', 'discount', 'promotion', 'ads', 'campaign', 'bundle'],
      support: ['support', 'agent', 'human', 'helpdesk', 'contact seller']
    };
  }

  // Get user context with role-based information
  async getUserContext(userId) {
    try {
      const context = {
        user: null,
        recentOrders: [],
        products: [],
        isSeller: false,
        sellerProducts: []
      };

      // Get user info
      context.user = await User.findById(userId).select('name email role isSellerApproved');

      // Determine if user is a seller
      context.isSeller = context.user?.role === 'seller' && context.user?.isSellerApproved;

      if (context.isSeller) {
        // Get seller-specific data
        context.sellerProducts = await Product.find({ seller: userId })
          .select('name price stock status')
          .limit(10);
      } else {
        // Get user-specific data (recent orders, etc.)
        context.recentOrders = await Order.find({ user: userId })
          .populate('orderItems.product', 'name price')
          .sort({ createdAt: -1 })
          .limit(5);
      }

      return context;
    } catch (error) {
      console.error('Error getting user context:', error);
      return { user: null, isSeller: false };
    }
  }

  // Extract intent using keyword matching instead of AI
  extractIntent(message) {
    const lowerMessage = message.toLowerCase();

    // Check for exact matches first
    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return intent;
        }
      }
    }

    // Check for FAQ matches
    return 'general_inquiry';
  }

  // Generate response based on user role and message content
  async generateResponse(userMessage, conversationHistory = [], userContext = null) {
    try {
      const intent = this.extractIntent(userMessage);
      const isSeller = userContext?.isSeller || false;
      const userRole = isSeller ? 'seller' : 'user';

      // Find matching FAQs first
      const matchingFAQs = await this.findMatchingFAQs(userMessage);

      let response = '';
      let responseType = 'general';

      // If FAQs match, use FAQ response
      if (matchingFAQs.length > 0) {
        response = matchingFAQs[0].answer;
        responseType = 'faq';
      } else {
        // Generate contextual response based on role and intent
        response = await this.generateContextualResponse(userMessage, intent, userRole, userContext);
        responseType = 'contextual';
      }

      return {
        response,
        matchingFAQs,
        tokensUsed: 0, // No AI tokens used
        responseType,
        intent,
        userRole
      };

    } catch (error) {
      console.error('Error generating response:', error);
      return {
        response: this.responseCategories.general.fallback[0],
        matchingFAQs: [],
        tokensUsed: 0,
        error: error.message
      };
    }
  }

  // Generate contextual response based on user role and intent
  async generateContextualResponse(message, intent, userRole, userContext) {
    const lowerMessage = message.toLowerCase();

    // Role-based responses
    if (userRole === 'seller') {
      return this.getSellerResponse(message, intent, userContext);
    } else {
      return this.getUserResponse(message, intent, userContext);
    }
  }

  // Get response for regular users (shoppers)
  async getUserResponse(message, intent, userContext) {
    const lowerMessage = message.toLowerCase();

    // Greetings
    if (/(^|\s)(hello|hi|hey|hola|good\s*(morning|afternoon|evening))/.test(lowerMessage)) {
      const greetings = this.responseCategories.general.greeting;
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Gratitude / closing
    if (/(thank\s*you|thanks|appreciate it|bye|goodbye)/.test(lowerMessage)) {
      const goodbyes = this.responseCategories.general.goodbye;
      return goodbyes[Math.floor(Math.random() * goodbyes.length)];
    }

    if (lowerMessage.includes('human') || lowerMessage.includes('agent') || lowerMessage.includes('support')) {
      return "I can connect you with our support specialists if you'd like, or I can keep helping here. Let me know your preference.";
    }

    // Check for specific user scenarios
    if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
      if (userContext.recentOrders.length > 0) {
        const latestOrder = userContext.recentOrders[0];
        return `I can help you track your recent order #${latestOrder._id.toString().slice(-8).toUpperCase()}. Your order status is: ${latestOrder.status}. Would you like more details or help with something else?`;
      } else {
        return "I can help you track your orders! Do you have an order number or would you like me to look up your recent orders?";
      }
    }

    if (lowerMessage.includes('product') || lowerMessage.includes('buy')) {
      return "I'd be happy to help you find the perfect product! What type of item are you looking for? You can browse our categories or I can recommend something based on your preferences.";
    }

    if (lowerMessage.includes('cart') || lowerMessage.includes('checkout')) {
      return "I can help you with your shopping cart! You can add items, update quantities, or proceed to checkout. What would you like to do?";
    }

    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return "We offer fast and reliable shipping! Standard delivery takes 3-5 business days, and express delivery is available. Free shipping on orders over $50. Would you like to know about shipping to your area?";
    }

    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return "We have a 30-day return policy for most items. Returns are free for defective products, and we'll process refunds within 5-7 business days of receiving your return. Need help starting a return?";
    }

    if (lowerMessage.includes('coupon') || lowerMessage.includes('discount') || lowerMessage.includes('voucher')) {
      return "We love deals! You can apply coupons at checkout or in your cart. Need help finding seller-specific promotions or marketplace-wide discounts?";
    }

    if (lowerMessage.includes('wishlist') || lowerMessage.includes('favourite')) {
      return "You can follow sellers and add products to your wishlist. Want instructions for creating collections or sharing them with friends?";
    }

    // Generic user responses
    const responses = this.responseCategories.user[intent] || this.responseCategories.general.fallback;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Get response for sellers (vendors)
  async getSellerResponse(message, intent, userContext) {
    const lowerMessage = message.toLowerCase();

    // Greetings
    if (/(^|\s)(hello|hi|hey|hola|good\s*(morning|afternoon|evening))/.test(lowerMessage)) {
      const greetings = this.responseCategories.general.greeting;
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (/(thank\s*you|thanks|appreciate it|bye|goodbye)/.test(lowerMessage)) {
      const goodbyes = this.responseCategories.general.goodbye;
      return goodbyes[Math.floor(Math.random() * goodbyes.length)];
    }

    if (lowerMessage.includes('human') || lowerMessage.includes('agent') || lowerMessage.includes('support')) {
      return "I can hand this over to our merchant success team, or we can keep working together here. What would you like me to do?";
    }

    // Check for specific seller scenarios
    if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
      const totalProducts = userContext.sellerProducts.length;
      const lowStockProducts = userContext.sellerProducts.filter(p => p.stock < 10).length;
      return `I can help you manage your inventory! You have ${totalProducts} products listed. ${lowStockProducts > 0 ? `${lowStockProducts} products are running low on stock.` : 'All products are well-stocked.'} Would you like to update inventory levels or set up stock alerts?`;
    }

    if (lowerMessage.includes('order') || lowerMessage.includes('sale')) {
      return "I can help you manage your orders! You can update order status, print shipping labels, handle returns, or view sales analytics. What would you like to work on?";
    }

    if (lowerMessage.includes('product') || lowerMessage.includes('listing')) {
      return "I can assist with your product listings! You can add new products, update existing ones, manage photos, or optimize your listings for better visibility. What would you like to do?";
    }

    if (lowerMessage.includes('payout') || lowerMessage.includes('bank') || lowerMessage.includes('disburse')) {
      return "Payouts are released once orders are delivered or completed. Want to check your payout schedule, update bank details, or enable express disbursement?";
    }

    if (lowerMessage.includes('campaign') || lowerMessage.includes('ads') || lowerMessage.includes('coupon')) {
      return "Marketing tools are ready! I can help you create coupons, join marketplace campaigns, or set up sponsored listings. What would you like to promote?";
    }

    // Generic seller responses
    const responses = this.responseCategories.seller[intent] || this.responseCategories.general.fallback;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Find matching FAQs
  async findMatchingFAQs(query, limit = 3) {
    try {
      const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);

      const faqs = await FAQ.find({
        isActive: true,
        $or: [
          { question: { $regex: query, $options: 'i' } },
          { keywords: { $in: keywords } }
        ]
      })
      .sort({ priority: -1 })
      .limit(limit);

      return faqs;
    } catch (error) {
      console.error('Error finding FAQs:', error);
      return [];
    }
  }

  // Suggest quick replies based on context and role
  async suggestQuickReplies(conversation, userContext) {
    const suggestions = [];
    const isSeller = userContext?.isSeller || false;

    if (isSeller) {
      // Seller-specific suggestions
      if (userContext.sellerProducts.some(p => p.stock < 10)) {
        suggestions.push('Update inventory', 'Check low stock');
      }
      suggestions.push('View sales', 'Manage orders', 'Add products', 'Marketing tools', 'Payout status');
    } else {
      // User-specific suggestions
      if (userContext.recentOrders.length > 0) {
        const latestOrder = userContext.recentOrders[0];
        if (latestOrder.status === 'pending') {
          suggestions.push('Track order', 'Order details');
        } else if (latestOrder.status === 'shipped') {
          suggestions.push('Track shipment', 'Delivery info');
        }
      }
      suggestions.push('Browse products', 'Cart help', 'Account settings', 'Contact support');
      suggestions.push('Payment options');
    }

    return suggestions.filter(Boolean).slice(0, 5);
  }
}

module.exports = new BuiltInChatbotService();
