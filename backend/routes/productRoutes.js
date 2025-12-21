const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  approveProduct,
  rejectProduct,
  getPendingProducts,
  addProductReview,
  updateProductReview,
  deleteProductReview,
  getProductReviews,
  verifyReview
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { validateProduct } = require('../middleware/validationMiddleware');

// Public routes (no authentication required)
// IMPORTANT: Specific routes must come before /:id to avoid route conflicts
router.get('/', getProducts); // Products with search, filter, sort, pagination
router.get('/featured', getFeaturedProducts); // Featured products
router.get('/category/:category', getProductsByCategory); // Products by category
router.get('/search', searchProducts); // Search products
router.get('/:id', getProductById); // Get product by ID - must be last
router.get('/:productId/reviews', getProductReviews); // Get product reviews

// Protected routes (require authentication)
router.use(authMiddleware);

// Review routes (authenticated users)
router.post('/:productId/reviews', addProductReview); // Add review
router.put('/:productId/reviews/:reviewId', updateProductReview); // Update review
router.delete('/:productId/reviews/:reviewId', deleteProductReview); // Delete review

// Seller routes
router.post('/', authorizeRoles('seller'), validateProduct, createProduct);
router.put('/:id', authorizeRoles('seller', 'admin'), validateProduct, updateProduct);
router.delete('/:id', authorizeRoles('seller', 'admin'), deleteProduct);

// Admin routes
router.put('/:productId/reviews/:reviewId/verify', authorizeRoles('admin'), verifyReview); // Verify review
router.get('/pending', authorizeRoles('admin'), getPendingProducts); // Get pending products
router.put('/:id/approve', authorizeRoles('admin'), approveProduct); // Approve product
router.put('/:id/reject', authorizeRoles('admin'), rejectProduct); // Reject product

module.exports = router;
