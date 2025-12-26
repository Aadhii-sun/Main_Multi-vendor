const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isSelf = req.user._id.toString() === user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const requesterIsAdmin = req.user.role === 'admin';
    const isSelf = req.user._id.toString() === user._id.toString();

    if (!requesterIsAdmin && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const { name, email, role, isSellerApproved, password } = req.body;
    
    // Update name with validation
    if (name) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 50) {
        return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
      }
      user.name = trimmedName;
    }
    
    // Update email with format and uniqueness check
    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      user.email = email.toLowerCase().trim();
    }
    
    // Allow self or admin to change password
    if (password && (requesterIsAdmin || isSelf)) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      user.password = password; // will be hashed by pre-save hook
    }

    // Only admins can change role and seller approval status
    if (requesterIsAdmin) {
      // Prevent admin from changing their own role
      if (role && user._id.toString() === req.user._id.toString() && role !== user.role) {
        return res.status(400).json({ message: 'Cannot change your own role' });
      }
      
      // Validate and update role
      if (role) {
        const validRoles = ['user', 'seller', 'admin'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({ message: 'Invalid role' });
        }
        user.role = role;
      }
      
      // Update seller approval status
      if (typeof isSellerApproved === 'boolean') {
        user.isSellerApproved = isSellerApproved;
      }
    }
    
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isSellerApproved: updatedUser.isSellerApproved,
      isActive: updatedUser.isActive
    });
  } catch (error) {
    // Handle duplicate email error (MongoDB unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['user', 'seller', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const users = await User.find({ role })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating other admins
    if (user.role === 'admin' && req.user.role === 'admin' && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot deactivate another admin' });
    }

    // Toggle active status
    user.isActive = !user.isActive;
    const updatedUser = await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
