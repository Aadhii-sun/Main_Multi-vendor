const express = require('express');
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons
} = require('../controllers/couponController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { validateCoupon: validateCouponData } = require('../middleware/validationMiddleware');

// Public routes
router.get('/active', getActiveCoupons); // Get active coupons for users
router.post('/validate', validateCoupon); // Validate coupon for order

// Admin routes (require authentication and admin role)
router.use(authMiddleware);
router.use(authorizeRoles('admin'));

router.get('/', getCoupons); // Get all coupons with pagination
router.post('/', validateCouponData, createCoupon); // Create new coupon
router.put('/:id', validateCouponData, updateCoupon); // Update coupon
router.delete('/:id', deleteCoupon); // Delete coupon

module.exports = router;
