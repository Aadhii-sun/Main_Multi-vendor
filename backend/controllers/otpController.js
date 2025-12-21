const User = require('../models/User');
const { sendEmail } = require('../config/emailService');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Send OTP for email login
exports.sendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log(`[OTP] Request to send OTP to: ${email} (type: ${type})`);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[OTP] User not found: ${email}`);
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    // Restrict admin OTP login to only the specific admin email
    const ALLOWED_ADMIN_EMAIL = 'adithyananimon9@gmail.com';
    if ((user.role === 'admin' || type === 'admin') && user.email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ 
        message: 'Admin access is restricted. Only authorized administrators can login.' 
      });
    }

    console.log(`[OTP] User found: ${user.name} (${user.role})`);

    // Check if user has exceeded OTP attempts
    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        message: 'Too many OTP attempts. Please try again later or use password login.'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP via email
    console.log(`[OTP] Attempting to send email to: ${email}`);
    const emailResult = await sendEmail(email, 'otpLogin', {
      otp,
      name: user.name
    });

    console.log(`[OTP] Email result:`, emailResult.success ? 'SUCCESS' : 'FAILED', emailResult.error || '');

    // Development fallback: if email fails, log OTP to console
    if (!emailResult.success) {
      // Always log OTP in development or when email is not configured
      const isDevMode = process.env.NODE_ENV === 'development' || !process.env.EMAIL_USER;
      
      console.log('\n========================================');
      console.log('🔐 OTP FOR DEVELOPMENT MODE');
      console.log('========================================');
      console.log(`Email: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log(`Expires in: 10 minutes`);
      console.log('========================================\n');
      
      // In development, we'll still return success but log the OTP
      if (isDevMode) {
        return res.json({
          message: 'OTP sent (check server console for development mode)',
          email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
          expiresIn: '10 minutes',
          developmentMode: true
        });
      }
      
      // In production, return error but still log OTP for debugging
      return res.status(500).json({
        message: 'Failed to send OTP email. Please check server console for OTP code.',
        error: emailResult.error,
        developmentMode: true
      });
    }

    res.json({
      message: 'OTP sent to your email address',
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for security
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('[OTP] Send OTP error:', error);
    console.error('[OTP] Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to send OTP', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Verify OTP and login
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Restrict admin OTP login to only the specific admin email
    const ALLOWED_ADMIN_EMAIL = 'adithyananimon9@gmail.com';
    if ((user.role === 'admin' || type === 'admin') && user.email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ 
        message: 'Admin access is restricted. Only authorized administrators can login.' 
      });
    }

    // Verify OTP
    const verification = user.verifyOTP(otp);

    if (!verification.valid) {
      await user.save(); // Save updated attempts
      return res.status(400).json({ message: verification.message });
    }

    // OTP verified successfully, save user and generate token
    await user.save();

    // Send success email
    await sendEmail(email, 'otpVerification', {
      name: user.name
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isGoogleUser: !!user.googleId
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if previous OTP is still valid
    if (user.isOTPValid()) {
      const remainingTime = Math.ceil((user.otpExpires - Date.now()) / 1000 / 60);
      return res.status(429).json({
        message: `Please wait ${remainingTime} minutes before requesting a new OTP`
      });
    }

    // Generate and send new OTP
    const otp = user.generateOTP();
    await user.save();

    const emailResult = await sendEmail(email, 'otpLogin', {
      otp,
      name: user.name
    });

    // Development fallback: if email fails, log OTP to console
    if (!emailResult.success) {
      if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_USER) {
        console.log('\n========================================');
        console.log('🔐 OTP FOR DEVELOPMENT MODE (RESEND)');
        console.log('========================================');
        console.log(`Email: ${email}`);
        console.log(`OTP: ${otp}`);
        console.log(`Expires in: 10 minutes`);
        console.log('========================================\n');
        
        return res.json({
          message: 'New OTP sent (check server console for development mode)',
          expiresIn: '10 minutes',
          developmentMode: true
        });
      }
      
      return res.status(500).json({
        message: 'Failed to send OTP email',
        error: emailResult.error
      });
    }

    res.json({
      message: 'New OTP sent to your email',
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
};

// Check OTP status (for frontend)
exports.checkOTPStatus = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = user.isOTPValid();
    const remainingTime = user.otpExpires ? Math.ceil((user.otpExpires - Date.now()) / 1000 / 60) : 0;

    res.json({
      hasValidOTP: isValid,
      remainingMinutes: remainingTime,
      attemptsLeft: 5 - user.otpAttempts,
      canRequestNew: !isValid
    });
  } catch (error) {
    console.error('Check OTP status error:', error);
    res.status(500).json({ message: 'Failed to check OTP status', error: error.message });
  }
};
