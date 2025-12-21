const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  validateCoupon
} = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

// All cart routes require authentication
router.use(authMiddleware);

// Cart management routes
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/item/:productId', removeFromCart);
router.delete('/clear', clearCart);

// Coupon validation
router.post('/validate-coupon', validateCoupon);

module.exports = router;
