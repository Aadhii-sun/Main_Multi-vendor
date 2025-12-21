const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus,
  moveToCart
} = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');

// All wishlist routes require authentication
router.use(authMiddleware);

// Wishlist management routes
router.get('/', getWishlist); // Get user's wishlist
router.post('/add', addToWishlist); // Add product to wishlist
router.delete('/item/:productId', removeFromWishlist); // Remove product from wishlist
router.delete('/clear', clearWishlist); // Clear entire wishlist

// Wishlist utilities
router.get('/check/:productId', checkWishlistStatus); // Check if product is in wishlist
router.post('/move-to-cart/:productId', moveToCart); // Move item from wishlist to cart

module.exports = router;
