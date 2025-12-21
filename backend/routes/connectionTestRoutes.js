const express = require('express');
const router = express.Router();
const ConnectionTester = require('../utils/connectionTester');

// Test all cloud service connections
router.get('/test', async (req, res) => {
  try {
    const tester = new ConnectionTester();
    const results = await tester.testAll();

    res.json({
      message: 'Connection tests completed',
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Connection testing failed',
      error: error.message
    });
  }
});

// Test specific service
router.get('/test/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const tester = new ConnectionTester();

    switch (service.toLowerCase()) {
      case 'mongodb':
        await tester.testMongoDB();
        break;
      case 'stripe':
        await tester.testStripe();
        break;
      case 'email':
        await tester.testEmail();
        break;
      default:
        return res.status(400).json({
          message: 'Invalid service. Available: mongodb, stripe, email'
        });
    }

    res.json({
      service,
      result: tester.getResults()[service],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: `Testing ${service} failed`,
      error: error.message
    });
  }
});

// Get environment configuration status (without exposing sensitive data)
router.get('/config', (req, res) => {
  const configStatus = {
    mongodb: !!process.env.MONGO_URI,
    stripe: !!process.env.STRIPE_SECRET_KEY,
    email: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    session: !!process.env.SESSION_SECRET,
    jwt: !!process.env.JWT_SECRET,
    clientUrl: !!process.env.CLIENT_URL,
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000
  };

  const configuredCount = Object.values(configStatus).filter(Boolean).length;
  const totalCount = Object.keys(configStatus).length;

  res.json({
    message: 'Environment configuration status',
    configStatus,
    summary: `${configuredCount}/${totalCount} environment variables configured`,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
