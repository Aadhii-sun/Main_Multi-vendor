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

router.post('/signup', validateUserSignup, signup);
router.post('/signin', validateUserSignin, signin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/create-admin', validateUserSignup, createAdmin);

// Current user route (protected)
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
