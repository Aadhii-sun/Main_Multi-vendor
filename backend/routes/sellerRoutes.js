const express = require('express');
const router = express.Router();
const {
  getSellers,
  getSellerById,
  approveSeller,
  registerAsSeller,
  rejectSeller,
  getPendingSellers,
  getApprovedSellers,
  getSellerAnalytics
} = require('../controllers/sellerController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Public routes (no authentication required)
router.get('/approved/list', getApprovedSellers); // Get approved sellers (for product listings)

// Authenticated routes
router.use(authMiddleware);

// User routes (become a seller)
router.post('/register', authorizeRoles('user'), registerAsSeller); // User: Apply to become seller

// Admin routes
router.get('/', authorizeRoles('admin'), getSellers); // Admin: Get all seller profiles
router.get('/pending/list', authorizeRoles('admin'), getPendingSellers); // Admin: Get pending sellers
router.put('/:id/approve', authorizeRoles('admin'), approveSeller); // Admin: Approve seller
router.put('/:id/reject', authorizeRoles('admin'), rejectSeller); // Admin: Reject seller

// Shared access routes
router.get('/:id', authorizeRoles('admin', 'seller'), getSellerById); // Get specific seller profile
router.get('/:id/analytics', authorizeRoles('admin', 'seller'), getSellerAnalytics); // Get seller analytics

module.exports = router;
