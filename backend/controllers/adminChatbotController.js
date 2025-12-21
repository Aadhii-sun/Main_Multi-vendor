const { FAQ, ChatbotConfig } = require('../models/Chatbot');
const Conversation = require('../models/Conversation');

// Get all FAQs
exports.getFAQs = async (req, res) => {
  try {
    const { category, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const faqs = await FAQ.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FAQ.countDocuments(filter);

    res.json({
      faqs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category, keywords, priority = 1 } = req.body;

    const faq = new FAQ({
      question,
      answer,
      category,
      keywords: keywords || [],
      priority
    });

    await faq.save();
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, keywords, priority, isActive } = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      id,
      { question, answer, category, keywords, priority, isActive },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    await FAQ.findByIdAndDelete(id);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chatbot configuration
exports.getChatbotConfig = async (req, res) => {
  try {
    let config = await ChatbotConfig.findOne();
    if (!config) {
      config = new ChatbotConfig();
      await config.save();
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update chatbot configuration
exports.updateChatbotConfig = async (req, res) => {
  try {
    const updates = req.body;
    let config = await ChatbotConfig.findOne();

    if (!config) {
      config = new ChatbotConfig(updates);
    } else {
      Object.assign(config, updates);
    }

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all conversations (admin view)
exports.getAllConversations = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;

    const conversations = await Conversation.find(filter)
      .populate('user', 'name email')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Conversation.countDocuments(filter);

    res.json({
      conversations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get conversation details (admin)
exports.getConversationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id)
      .populate('user', 'name email role');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Respond to conversation (admin)
exports.respondToConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Add admin response
    conversation.messages.push({
      role: 'assistant',
      content: `[ADMIN] ${message}`,
      timestamp: new Date(),
      metadata: { isAdminResponse: true }
    });

    conversation.status = 'active'; // Keep conversation active
    await conversation.save();

    res.json({ message: 'Response sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get conversation analytics
exports.getChatbotAnalytics = async (req, res) => {
  try {
    const totalConversations = await Conversation.countDocuments();
    const activeConversations = await Conversation.countDocuments({ status: 'active' });
    const totalMessages = await Conversation.aggregate([
      { $unwind: '$messages' },
      { $count: 'totalMessages' }
    ]);

    const conversationsByCategory = await Conversation.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const messagesByRole = await Conversation.aggregate([
      { $unwind: '$messages' },
      { $group: { _id: '$messages.role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: {
        totalConversations,
        activeConversations,
        totalMessages: totalMessages[0]?.totalMessages || 0
      },
      byCategory: conversationsByCategory,
      messageStats: messagesByRole
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
