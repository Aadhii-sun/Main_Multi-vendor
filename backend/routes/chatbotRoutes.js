const express = require('express');
const router = express.Router();
const {
  startConversation,
  sendMessage,
  getConversation,
  getConversations,
  closeConversation,
  getChatbotConfig,
  getQuickSuggestions
} = require('../controllers/chatbotController');
const authMiddleware = require('../middleware/authMiddleware');

// All chatbot routes require authentication
router.use(authMiddleware);

// Conversation management
router.post('/conversation', startConversation);
router.get('/conversations', getConversations);
router.get('/conversation/:conversationId', getConversation);
router.put('/conversation/:conversationId/close', closeConversation);

// Messaging
router.post('/message', sendMessage);

// Configuration and utilities
router.get('/config', getChatbotConfig);
router.get('/suggestions', getQuickSuggestions);

module.exports = router;
