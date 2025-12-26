const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Log incoming request for debugging
  console.log('📝 Signup request received:', { 
    name: name ? 'provided' : 'missing', 
    email: email ? 'provided' : 'missing',
    password: password ? 'provided' : 'missing',
    role: role || 'not provided'
  });
  
  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'email', 'password'],
        received: { name: !!name, email: !!email, password: !!password }
      });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Only allow admin role if registering through admin endpoint
    // Default to 'user' role - only set 'seller' if explicitly provided
    const allowedRoles = ['user', 'seller'];
    const userRole = (role && allowedRoles.includes(role)) ? role : 'user';
    
    // Log for debugging
    console.log(`Registration - Email: ${email}, Requested role: ${role}, Assigned role: ${userRole}`);

    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    });

    const token = generateToken(user._id, user.role);

    // Send welcome email
    try {
      await NotificationService.sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    const token = generateToken(admin._id, admin.role);
    res.status(201).json({
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Restrict admin login to only the specific admin email
    const ALLOWED_ADMIN_EMAIL = 'adithyananimon9@gmail.com';
    if (user.role === 'admin' && user.email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ 
        message: 'Admin access is restricted. Only authorized administrators can login.' 
      });
    }

    // Check if user has valid OTP (OTP login instead of password)
    // For admin, allow OTP login if they have a valid OTP
    if (user.isOTPValid() && user.role !== 'admin') {
      return res.status(400).json({
        message: 'An OTP has been sent to your email. Please use OTP login instead.',
        requiresOTP: true,
        email: user.email
      });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user (for frontend to check auth status)
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSellerApproved: user.isSellerApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // In a real application, you would send an email here
    // For now, we'll just return the token (remove this in production)
    res.json({
      message: 'Password reset token generated',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
