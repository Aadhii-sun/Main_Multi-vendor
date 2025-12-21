const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentDetails,
  refundPayment,
  getAllPayments,
  createPaymentIntentForCheckout,
  getPaymentDiagnostics,
  testPaymentSystem,
  getPaymentReadiness
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Webhook endpoint (exported for server.js direct route)
// No authentication required for webhooks
router.webhookHandler = handleWebhook;

// Public test endpoints (no authentication required)
router.get('/test', testPaymentSystem);
router.get('/ready', getPaymentReadiness);

// Authenticated routes
router.use(authMiddleware);

// Payment creation and confirmation
router.post('/create-payment-intent', createPaymentIntent);
router.post('/checkout-payment', createPaymentIntentForCheckout);
router.post('/confirm-payment', confirmPayment);

// User payment history
router.get('/history', getPaymentHistory);

// Admin routes
router.get('/', authorizeRoles('admin'), getAllPayments);
router.get('/:id', authorizeRoles('admin'), getPaymentDetails);
router.post('/:id/refund', authorizeRoles('admin'), refundPayment);
router.get('/admin/diagnostics', authorizeRoles('admin'), getPaymentDiagnostics);

module.exports = router;
