const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrdersForUser,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  editOrder,
  getOrderById,
  getOrdersByStatus,
  checkoutFromCart
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/', authorizeRoles('user'), createOrder);
router.post('/checkout', authorizeRoles('user'), checkoutFromCart);
router.get('/myorders', authorizeRoles('user'), getOrdersForUser);
router.get('/', authorizeRoles('admin'), getAllOrders);
router.get('/status/:status', authorizeRoles('admin'), getOrdersByStatus);
router.get('/:id', authorizeRoles('admin', 'user'), getOrderById);
router.put('/:id/status', authorizeRoles('admin', 'seller'), updateOrderStatus);
router.put('/:id/cancel', authorizeRoles('admin'), cancelOrder);
router.put('/:id/edit', authorizeRoles('admin'), editOrder);

module.exports = router;
