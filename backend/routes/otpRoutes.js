const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  resendOTP,
  checkOTPStatus
} = require('../controllers/otpController');
const rateLimit = require('express-rate-limit');

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

// Public routes (no authentication required)
console.log('📋 Registering OTP routes...');
router.post('/send', otpLimiter, (req, res, next) => {
  console.log('📨 OTP /send route hit!', {
    method: req.method,
    url: req.originalUrl,
    body: { email: req.body?.email, type: req.body?.type }
  });
  next();
}, sendOTP);
console.log('✅ Registered: POST /api/otp/send');
router.post('/verify', verifyLimiter, verifyOTP);
console.log('✅ Registered: POST /api/otp/verify');
router.post('/resend', otpLimiter, resendOTP);
router.get('/status/:email', checkOTPStatus);

module.exports = router;
