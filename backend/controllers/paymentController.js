// Lazy initialization of Stripe to ensure env vars are loaded
let stripeInstance = null;
const getStripe = () => {
  if (!stripeInstance) {
    if (process.env.STRIPE_SECRET_KEY) {
      stripeInstance = require('stripe')(process.env.STRIPE_SECRET_KEY);
      console.log('✅ Stripe initialized with secret key');
    } else {
      console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    }
  }
  return stripeInstance;
};

const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

// Validate payment system configuration
const validatePaymentConfig = () => {
  const issues = [];

  if (!process.env.STRIPE_SECRET_KEY) {
    issues.push('STRIPE_SECRET_KEY environment variable not set');
  }

  // STRIPE_WEBHOOK_SECRET is optional for basic payment intents
  // Only required for webhook handling
  // if (!process.env.STRIPE_WEBHOOK_SECRET) {
  //   issues.push('STRIPE_WEBHOOK_SECRET environment variable not set');
  // }

  return issues;
};

// Create payment intent for order
exports.createPaymentIntent = async (req, res) => {
  const { orderId, currency = 'usd' } = req.body;

  // Validate configuration first
  const configIssues = validatePaymentConfig();
  if (configIssues.length > 0) {
    console.error('Payment configuration issues:', configIssues);
    return res.status(500).json({
      message: 'Payment system not properly configured',
      issues: configIssues
    });
  }

  try {
    // Find the order
    const order = await Order.findById(orderId).populate('orderItems.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    // Check if order is already paid
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order cannot be paid' });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({
        message: 'Payment system not properly configured',
        issues: ['Stripe is not initialized. Please set STRIPE_SECRET_KEY in environment variables.']
      });
    }

    console.log(`Creating payment intent for order ${orderId}, amount: ${order.totalPrice}`);

    const amount = Math.round(order.totalPrice * 100); // Convert to cents

    if (amount < 50) { // Stripe minimum is $0.50
      return res.status(400).json({
        message: 'Order amount is too small. Minimum payment is $0.50.'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        order_id: orderId,
        user_id: req.user._id.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record
    const payment = new Payment({
      user: req.user._id,
      order: orderId,
      stripePaymentIntentId: paymentIntent.id,
      amount: order.totalPrice,
      currency,
      status: 'pending',
      metadata: paymentIntent.metadata
    });

    await payment.save();

    // Link payment to order
    order.payment = payment._id;
    await order.save();

    console.log(`Payment intent created successfully: ${paymentIntent.id}`);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: orderId,
      amount: order.totalPrice
    });
  } catch (error) {
    console.error('Stripe payment intent error (createPaymentIntent):', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    });
    
    // Provide more helpful error messages
    let errorMessage = 'Payment initiation failed';
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = `Invalid payment request: ${error.message}`;
    } else if (error.type === 'StripeAPIError') {
      errorMessage = `Stripe API error: ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      message: errorMessage, 
      error: error.message,
      type: error.type,
      code: error.code
    });
  }
};

// Create payment intent for checkout (enhanced version)
exports.createPaymentIntentForCheckout = async (req, res) => {
  // Validate configuration first
  const configIssues = validatePaymentConfig();
  if (configIssues.length > 0) {
    console.error('Payment configuration issues:', configIssues);
    return res.status(500).json({
      message: 'Payment system not properly configured',
      issues: configIssues
    });
  }

  try {
    const { orderId } = req.body;

    if (!orderId) {
      console.error('❌ Missing orderId in request body');
      return res.status(400).json({ message: 'Order ID is required' });
    }

    console.log(`🔍 Looking up order: ${orderId}`);

    // Find the order
    const order = await Order.findById(orderId).populate('orderItems.product');
    if (!order) {
      console.error(`❌ Order not found: ${orderId}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log(`✅ Order found: ${order._id}, Total: $${order.totalPrice}, Status: ${order.status}, User: ${order.user}, Request User: ${req.user._id}`);

    // Verify order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      console.error(`❌ Authorization failed: Order user (${order.user}) != Request user (${req.user._id})`);
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      order: orderId,
      status: { $in: ['succeeded', 'pending'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        message: 'Payment already initiated for this order',
        paymentIntentId: existingPayment.stripePaymentIntentId
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      console.error('❌ Stripe not initialized - STRIPE_SECRET_KEY missing');
      return res.status(500).json({
        message: 'Payment system not properly configured',
        issues: ['Stripe is not initialized. Please set STRIPE_SECRET_KEY in environment variables.']
      });
    }

    const amount = Math.round(order.totalPrice * 100); // Convert to cents
    console.log(`💰 Creating payment intent - Amount: $${order.totalPrice} (${amount} cents)`);

    if (amount < 50) { // Stripe minimum is $0.50
      console.error(`❌ Amount too small: ${amount} cents (minimum: 50 cents)`);
      return res.status(400).json({
        message: 'Order amount is too small. Minimum payment is $0.50.'
      });
    }

    console.log('🔑 Creating Stripe payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        order_id: orderId,
        user_id: req.user._id.toString(),
        order_total: order.totalPrice.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record
    const payment = new Payment({
      user: req.user._id,
      order: orderId,
      stripePaymentIntentId: paymentIntent.id,
      amount: order.totalPrice,
      currency: 'usd',
      status: 'pending',
      metadata: paymentIntent.metadata
    });

    await payment.save();

    // Link payment to order
    order.payment = payment._id;
    await order.save();

    console.log(`✅ Payment intent created successfully: ${paymentIntent.id}`);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: orderId,
      amount: order.totalPrice
    });
  } catch (error) {
    console.error('Stripe payment intent error (createPaymentIntentForCheckout):', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack?.substring(0, 500) // First 500 chars of stack
    });
    
    // Provide more helpful error messages
    let errorMessage = 'Payment initiation failed';
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = `Invalid payment request: ${error.message}`;
    } else if (error.type === 'StripeAPIError') {
      errorMessage = `Stripe API error: ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      message: errorMessage, 
      error: error.message,
      type: error.type,
      code: error.code
    });
  }
};

// Confirm payment and update order status
exports.confirmPayment = async (req, res) => {
  const { paymentIntentId } = req.body;

  console.log('Confirming payment:', paymentIntentId);

  // Validate configuration first
  const configIssues = validatePaymentConfig();
  if (configIssues.length > 0) {
    console.error('Payment configuration issues:', configIssues);
    return res.status(500).json({
      message: 'Payment system not properly configured',
      issues: configIssues
    });
  }

  try {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId })
      .populate('order')
      .populate('user');

    if (!payment) {
      console.error('Payment not found for intent:', paymentIntentId);
      return res.status(404).json({ message: 'Payment not found' });
    }

    console.log('Found payment record:', {
      id: payment._id,
      status: payment.status,
      orderId: payment.order?._id,
      userId: payment.user?._id
    });

    // Retrieve payment intent from Stripe
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ message: 'Payment system not properly configured' });
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('Stripe payment intent status:', paymentIntent.status);

    if (paymentIntent.status === 'succeeded') {
      payment.status = 'succeeded';
      payment.stripeChargeId = paymentIntent.charges.data[0]?.id;

      // Update payment method details
      if (paymentIntent.charges.data[0]?.payment_method_details?.card) {
        const card = paymentIntent.charges.data[0].payment_method_details.card;
        payment.paymentMethod = {
          type: 'card',
          last4: card.last4,
          brand: card.brand,
          country: card.country
        };
      }

      payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
      await payment.save();

      // Update order status
      payment.order.status = 'confirmed';
      payment.order.payment = payment._id;
      await payment.order.save();

      console.log('Payment confirmed successfully:', payment._id);

      // Send payment confirmation email
      try {
        await NotificationService.sendPaymentConfirmation(payment, payment.order, payment.user);
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
      }

      return res.status(200).json({
        message: 'Payment confirmed successfully',
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          receiptUrl: payment.receiptUrl
        }
      });
    } else {
      payment.status = 'failed';
      payment.failureReason = paymentIntent.last_payment_error?.message;
      await payment.save();

      console.log('Payment failed:', paymentIntent.last_payment_error?.message);

      return res.status(400).json({
        message: 'Payment failed',
        reason: payment.failureReason
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Payment confirmation failed', error: error.message });
  }
};

// Handle Stripe webhook
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('Webhook received:', {
    hasSignature: !!sig,
    hasEndpointSecret: !!endpointSecret,
    bodyLength: req.body ? req.body.length : 0
  });

  let event;

  try {
    // Check if webhook secret is configured
    if (!endpointSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).json({ message: 'Webhook secret not configured' });
    }

    if (!sig) {
      console.error('No Stripe signature found in webhook request');
      return res.status(400).json({ message: 'No signature found' });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe not initialized' });
    }
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('Webhook event verified:', event.type, event.id);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).json({ message: `Webhook signature verification failed: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Processing successful payment:', paymentIntent.id);
        await handleSuccessfulPayment(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Processing failed payment:', failedPayment.id);
        await handleFailedPayment(failedPayment);
        break;

      case 'charge.dispute.created':
        const dispute = event.data.object;
        console.log('Dispute created:', dispute.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed', error: error.message });
  }
};

// Handle successful payment from webhook
async function handleSuccessfulPayment(paymentIntent) {
  try {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id })
      .populate('order')
      .populate('user');

    if (payment && payment.status !== 'succeeded') {
      payment.status = 'succeeded';
      payment.stripeChargeId = paymentIntent.charges.data[0]?.id;

      // Update payment method details
      if (paymentIntent.charges.data[0]?.payment_method_details?.card) {
        const card = paymentIntent.charges.data[0].payment_method_details.card;
        payment.paymentMethod = {
          type: 'card',
          last4: card.last4,
          brand: card.brand,
          country: card.country
        };
      }

      payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
      await payment.save();

      // Update order status
      if (payment.order) {
        payment.order.status = 'confirmed';
        payment.order.payment = payment._id;
        await payment.order.save();

        // Send payment confirmation email
        try {
          await NotificationService.sendPaymentConfirmation(payment, payment.order, payment.user);
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
        }
      }
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Handle failed payment from webhook
async function handleFailedPayment(paymentIntent) {
  try {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id })
      .populate('order');

    if (payment) {
      payment.status = 'failed';
      payment.failureReason = paymentIntent.last_payment_error?.message;
      await payment.save();

      // Update order status
      if (payment.order) {
        payment.order.status = 'cancelled';
        await payment.order.save();
      }
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

// Get payment history for user
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('order', 'totalPrice status createdAt')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment details (admin only)
exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('order', 'totalPrice status orderItems');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refund payment (admin only)
exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'succeeded') {
      return res.status(400).json({ message: 'Can only refund successful payments' });
    }

    // Create refund in Stripe
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ message: 'Payment system not properly configured' });
    }
    const refund = await stripe.refunds.create({
      charge: payment.stripeChargeId,
      amount: Math.round(payment.amount * 100), // Convert back to cents
      reason: req.body.reason || 'requested_by_customer'
    });

    payment.status = 'refunded';
    await payment.save();

    res.json({
      message: 'Payment refunded successfully',
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Refund failed', error: error.message });
  }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = status ? { status } : {};
    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('order', 'totalPrice status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Payment system test (public endpoint for basic checks)
exports.testPaymentSystem = async (req, res) => {
  try {
    console.log('Testing payment system...');

    const testResults = {
      timestamp: new Date(),
      stripe: {
        configured: !!process.env.STRIPE_SECRET_KEY,
        webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        keyFormat: 'none'
      },
      database: {
        paymentModel: !!Payment,
        orderModel: !!Order
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasAuth: !!require('../middleware/authMiddleware'),
        hasRoleAuth: !!require('../middleware/roleMiddleware')
      }
    };

    // Check Stripe key format if configured
    if (process.env.STRIPE_SECRET_KEY) {
      if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
        testResults.stripe.keyFormat = 'test';
      } else if (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
        testResults.stripe.keyFormat = 'live';
      } else {
        testResults.stripe.keyFormat = 'unknown';
      }
    }

    // Test Stripe connection (basic check)
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        // Simple API call to test Stripe connectivity
        const stripe = getStripe();
        if (stripe) {
          await stripe.balance.retrieve();
          testResults.stripe.connected = true;
        } else {
          testResults.stripe.connected = false;
          testResults.stripe.error = 'Stripe not initialized';
        }
      } catch (stripeError) {
        testResults.stripe.connected = false;
        testResults.stripe.error = stripeError.message;
        console.error('Stripe connection test failed:', stripeError.message);
      }
    }

    // Test database models
    try {
      const paymentCount = await Payment.countDocuments();
      const orderCount = await Order.countDocuments();
      testResults.database.paymentCount = paymentCount;
      testResults.database.orderCount = orderCount;
      testResults.database.connected = true;
    } catch (dbError) {
      testResults.database.connected = false;
      testResults.database.error = dbError.message;
      console.error('Database test failed:', dbError.message);
    }

    console.log('Payment system test results:', testResults);

    res.json({
      message: 'Payment system test completed',
      results: testResults
    });
  } catch (error) {
    console.error('Payment system test failed:', error);
    res.status(500).json({ message: 'Payment system test failed', error: error.message });
  }
};

// Check if payment system is ready for use
exports.getPaymentReadiness = async (req, res) => {
  try {
    const issues = [];
    const recommendations = [];

    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      issues.push('STRIPE_SECRET_KEY environment variable not set');
      recommendations.push('Set STRIPE_SECRET_KEY in your .env file');
    } else if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      issues.push('Invalid Stripe secret key format');
      recommendations.push('Stripe secret keys should start with "sk_"');
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      issues.push('STRIPE_WEBHOOK_SECRET environment variable not set');
      recommendations.push('Set STRIPE_WEBHOOK_SECRET from your Stripe dashboard');
    }

    // Check database connection
    try {
      await Payment.findOne({});
      await Order.findOne({});
    } catch (dbError) {
      issues.push('Database connection failed');
      recommendations.push('Check MongoDB connection string and network access');
    }

    // Check models
    if (!Payment || !Order) {
      issues.push('Payment or Order models not loaded');
      recommendations.push('Ensure all model files are properly exported');
    }

    const readiness = {
      ready: issues.length === 0,
      issues,
      recommendations,
      timestamp: new Date()
    };

    console.log('Payment readiness check:', readiness);

    res.json({
      message: readiness.ready ? 'Payment system is ready' : 'Payment system has issues',
      readiness
    });
  } catch (error) {
    console.error('Payment readiness check failed:', error);
    res.status(500).json({
      message: 'Payment readiness check failed',
      readiness: {
        ready: false,
        issues: ['Internal server error during readiness check'],
        recommendations: ['Check server logs for detailed error information'],
        timestamp: new Date()
      }
    });
  }
};

// Payment system diagnostic (admin only)
exports.getPaymentDiagnostics = async (req, res) => {
  try {
    console.log('Running payment system diagnostics...');

    const diagnostics = {
      timestamp: new Date(),
      stripe: {
        configured: !!process.env.STRIPE_SECRET_KEY,
        webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        keyFormat: process.env.STRIPE_SECRET_KEY ?
          (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'test' : 'live') : 'none'
      },
      database: {
        paymentCount: await Payment.countDocuments(),
        pendingPayments: await Payment.countDocuments({ status: 'pending' }),
        succeededPayments: await Payment.countDocuments({ status: 'succeeded' }),
        failedPayments: await Payment.countDocuments({ status: 'failed' })
      },
      recentPayments: await Payment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('stripePaymentIntentId status amount createdAt')
    };

    console.log('Payment diagnostics:', diagnostics);

    res.json({
      message: 'Payment system diagnostics',
      diagnostics
    });
  } catch (error) {
    console.error('Payment diagnostics error:', error);
    res.status(500).json({ message: 'Diagnostics failed', error: error.message });
  }
};
