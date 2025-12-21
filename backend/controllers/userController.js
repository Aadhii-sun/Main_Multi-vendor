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
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const requesterIsAdmin = req.user.role === 'admin';
    const isSelf = req.user._id.toString() === user._id.toString();

    if (!requesterIsAdmin && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const { name, email, role, isSellerApproved, password, seller } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    // Allow self or admin to change password
    if (password && (requesterIsAdmin || isSelf)) {
      user.password = password; // will be hashed by pre-save hook
    }
    // Allow seller fields to be edited by self (if they are seller) or admin
    if (seller && (requesterIsAdmin || (isSelf && user.role === 'seller'))) {
      user.seller = { ...(user.seller || {}), ...seller };
    }

    if (requesterIsAdmin) {
      if (role) {
        user.role = role;
      }
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
      isSellerApproved: updatedUser.isSellerApproved
    });
  } catch (error) {
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
