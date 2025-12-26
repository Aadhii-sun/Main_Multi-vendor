const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  resendOTP,
  checkOTPStatus
} = require('../controllers/otpController');
const rateLimit = require('express-rate-limit');

// Log that OTP routes file is loaded
console.log('✅ OTP routes file loaded successfully');

// Rate limiting for OTP requests (prevent spam)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 OTP requests per 15 minutes
  message: 'Too many OTP requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for OTP verification attempts
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 verification attempts per 15 minutes
  message: 'Too many verification attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Test route to verify OTP routes are working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'OTP routes are working correctly',
    timestamp: new Date().toISOString(),
    routes: {
      'POST /api/otp/send': 'Send OTP to email',
      'POST /api/otp/verify': 'Verify OTP code',
      'POST /api/otp/resend': 'Resend OTP',
      'GET /api/otp/status/:email': 'Check OTP status'
    }
  });
});

// Public routes (no authentication required)
console.log('📋 Registering OTP routes...');
router.post('/send', otpLimiter, (req, res, next) => {
  console.log('📨 OTP /send route hit!', {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    body: { email: req.body?.email, type: req.body?.type }
  });
  next();
}, sendOTP);
console.log('✅ Registered: POST /api/otp/send');

router.post('/verify', verifyLimiter, (req, res, next) => {
  console.log('📨 OTP /verify route hit!', {
    method: req.method,
    url: req.originalUrl,
    path: req.path
  });
  next();
}, verifyOTP);
console.log('✅ Registered: POST /api/otp/verify');

router.post('/resend', otpLimiter, resendOTP);
console.log('✅ Registered: POST /api/otp/resend');

router.get('/status/:email', checkOTPStatus);
console.log('✅ Registered: GET /api/otp/status/:email');

console.log('✅ All OTP routes registered successfully');

module.exports = router;
