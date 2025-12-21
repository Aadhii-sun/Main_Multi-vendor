const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserStats,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getPendingSellers,
  approveSeller,
  rejectSeller
} = require('../controllers/adminController');
const {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getChatbotConfig,
  updateChatbotConfig,
  getAllConversations,
  getConversationDetails,
  respondToConversation,
  getChatbotAnalytics
} = require('../controllers/adminChatbotController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const jwt = require('jsonwebtoken');

// Direct admin access endpoint (development only)
router.post('/direct-access', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = 'adithyaananimon9@gmail.com';
    const adminPassword = 'Adi@123456789';
    
    if (email === adminEmail && password === adminPassword) {
      // Create a token for direct admin access
      const token = jwt.sign(
        { id: 'admin', role: 'admin', email: adminEmail },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          _id: 'admin',
          email: adminEmail,
          name: 'Admin User',
          role: 'admin',
          isAdmin: true,
        }
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid admin credentials'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(authorizeRoles('admin'));

// Dashboard routes
router.get('/dashboard', getDashboardStats);
router.get('/users/stats', getUserStats);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:role', getAllUsers); // Get users by role
router.get('/user/:id', getUserById); // Get specific user
router.put('/user/:id', updateUser); // Update user
router.delete('/user/:id', deleteUser); // Delete user
router.put('/user/:id/toggle-status', toggleUserStatus); // Toggle user active status

// Seller management routes
router.get('/sellers/pending', getPendingSellers); // Get pending seller approvals
router.put('/seller/:sellerId/approve', approveSeller); // Approve seller
router.put('/seller/:sellerId/reject', rejectSeller); // Reject seller

// Chatbot management routes
router.get('/chatbot/faqs', getFAQs);
router.post('/chatbot/faqs', createFAQ);
router.put('/chatbot/faqs/:id', updateFAQ);
router.delete('/chatbot/faqs/:id', deleteFAQ);

router.get('/chatbot/config', getChatbotConfig);
router.put('/chatbot/config', updateChatbotConfig);

router.get('/chatbot/conversations', getAllConversations);
router.get('/chatbot/conversation/:id', getConversationDetails);
router.post('/chatbot/conversation/:id/respond', respondToConversation);

router.get('/chatbot/analytics', getChatbotAnalytics);

module.exports = router;
