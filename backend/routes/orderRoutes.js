const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrdersForUser,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/', authorizeRoles('user'), createOrder);
router.get('/myorders', authorizeRoles('user'), getOrdersForUser);
router.get('/', authorizeRoles('admin'), getAllOrders);
router.put('/:id/status', authorizeRoles('admin'), updateOrderStatus);

module.exports = router;
