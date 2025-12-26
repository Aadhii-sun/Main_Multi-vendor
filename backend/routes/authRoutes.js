const express = require('express');
const router = express.Router();
const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  createAdmin,
  getCurrentUser
} = require('../controllers/authController');
const { validateUserSignup, validateUserSignin } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// Add logging middleware before validation
router.post('/signup', (req, res, next) => {
  console.log('📝 /api/auth/signup route hit!', {
    body: req.body,
    bodyKeys: Object.keys(req.body || {})
  });
  next();
}, validateUserSignup, signup);
router.post('/signin', validateUserSignin, signin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/create-admin', validateUserSignup, createAdmin);

// Current user route (protected)
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
