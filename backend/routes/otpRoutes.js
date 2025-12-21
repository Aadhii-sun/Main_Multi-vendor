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
router.post('/send', otpLimiter, sendOTP);
router.post('/verify', verifyLimiter, verifyOTP);
router.post('/resend', otpLimiter, resendOTP);
router.get('/status/:email', checkOTPStatus);

module.exports = router;
