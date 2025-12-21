const Conversation = require('../models/Conversation');
const builtInChatbotService = require('../services/builtInChatbotService');
const { ChatbotConfig } = require('../models/Chatbot');

// Start new conversation or get existing one
exports.startConversation = async (req, res) => {
  try {
    const { category = 'general', initialMessage } = req.body;

    // Check if user has an active conversation in the same category
    let conversation = await Conversation.findOne({
      user: req.user._id,
      category,
      status: 'active'
    }).sort({ updatedAt: -1 });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        user: req.user._id,
        category,
        messages: []
      });
    }

    // Add initial message if provided
    if (initialMessage) {
      conversation.messages.push({
        role: 'user',
        content: initialMessage
      });

      // Get user context for better responses
      const userContext = await builtInChatbotService.getUserContext(req.user._id);

      // Generate response using built-in service
      const aiResponse = await builtInChatbotService.generateResponse(
        initialMessage,
        conversation.messages,
        userContext
      );

      conversation.messages.push({
        role: 'assistant',
        content: aiResponse.response,
        metadata: {
          matchingFAQs: aiResponse.matchingFAQs,
          responseType: aiResponse.responseType,
          intent: aiResponse.intent,
          userRole: aiResponse.userRole
        }
      });

      // Extract and set conversation intent/category
      const intent = builtInChatbotService.extractIntent(initialMessage);
      if (intent && intent !== 'general_inquiry') {
        conversation.category = intent + '_support';
      }
    }

    await conversation.save();
    await conversation.populate('user', 'name email');

    res.status(201).json({
      conversation: {
        _id: conversation._id,
        title: conversation.title,
        category: conversation.category,
        status: conversation.status,
        messageCount: conversation.messageCount,
        lastMessage: conversation.lastMessage,
        createdAt: conversation.createdAt
      },
      messages: conversation.messages
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ message: 'Failed to start conversation', error: error.message });
  }
};

// Send message to chatbot
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ message: 'Conversation ID and message are required' });
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.status === 'closed') {
      return res.status(400).json({ message: 'This conversation is closed' });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message
    });

    // Get user context
    const userContext = await builtInChatbotService.getUserContext(req.user._id);

    // Generate response using built-in service
    const aiResponse = await builtInChatbotService.generateResponse(
      message,
      conversation.messages,
      userContext
    );

    // Add assistant response
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse.response,
      metadata: {
        matchingFAQs: aiResponse.matchingFAQs,
        responseType: aiResponse.responseType,
        intent: aiResponse.intent,
        userRole: aiResponse.userRole
      }
    });

    // Update conversation title if this is the first few messages
    if (conversation.messages.length <= 3) {
      const intent = builtInChatbotService.extractIntent(message);
      if (intent && intent !== 'general_inquiry') {
        conversation.category = intent + '_support';
        conversation.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
      }
    }

    await conversation.save();
    await conversation.populate('user', 'name email');

    res.json({
      message: 'Message sent successfully',
      conversation: {
        _id: conversation._id,
        title: conversation.title,
        category: conversation.category,
        status: conversation.status,
        messageCount: conversation.messageCount,
        lastMessage: conversation.lastMessage
      },
      response: conversation.messages[conversation.messages.length - 1]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

// Get conversation history
exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user._id
    }).populate('user', 'name email');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Failed to get conversation', error: error.message });
  }
};

// Get user's conversations
exports.getConversations = async (req, res) => {
  try {
    const { status = 'active', category, limit = 20 } = req.query;

    const filter = {
      user: req.user._id
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    const conversations = await Conversation.find(filter)
      .populate('user', 'name email')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to get conversations', error: error.message });
  }
};

// Close conversation
exports.closeConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversation.status = 'closed';
    await conversation.save();

    res.json({ message: 'Conversation closed successfully' });
  } catch (error) {
    console.error('Close conversation error:', error);
    res.status(500).json({ message: 'Failed to close conversation', error: error.message });
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
    console.error('Get config error:', error);
    res.status(500).json({ message: 'Failed to get configuration', error: error.message });
  }
};

// Get quick suggestions
exports.getQuickSuggestions = async (req, res) => {
  try {
    const userContext = await builtInChatbotService.getUserContext(req.user._id);
    const suggestions = await builtInChatbotService.suggestQuickReplies(null, userContext);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Failed to get suggestions', error: error.message });
  }
};
