const express = require('express');
const router = express.Router();
const { signup, signin, forgotPassword, resetPassword } = require('../controllers/authController');
const { validateUserSignup, validateUserSignin } = require('../middleware/validationMiddleware');

router.post('/signup', validateUserSignup, signup);
router.post('/signin', validateUserSignin, signin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
