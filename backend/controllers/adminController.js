const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const NotificationService = require('../services/notificationService');

exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Get order statistics by status
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Get revenue (sum of all delivered orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get recent orders (last 10)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get top products by order count
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalOrdered: { $sum: '$orderItems.qty' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalOrdered: 1,
          price: '$product.price'
        }
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 5 }
    ]);

    const stats = {
      overview: {
        totalUsers,
        totalSellers,
        totalAdmins,
        totalProducts,
        totalOrders,
        totalRevenue
      },
      orders: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      recentOrders,
      topProducts
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const query = role ? { role } : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
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
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isSellerApproved } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString() && role && role !== user.role) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ['user', 'seller', 'admin'].includes(role)) {
      user.role = role;
    }
    if (isSellerApproved !== undefined) {
      user.isSellerApproved = isSellerApproved;
    }

    const updatedUser = await user.save();
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({
      message: 'User deleted successfully',
      deletedUserId: req.params.id
    });
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

    // Toggle active status
    user.isActive = !user.isActive;
    const updatedUser = await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingSellers = async (req, res) => {
  try {
    const pendingSellers = await User.find({
      role: 'seller',
      isSellerApproved: false
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json(pendingSellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    if (seller.role !== 'seller') {
      return res.status(400).json({ message: 'User is not a seller' });
    }

    seller.isSellerApproved = true;
    const updatedSeller = await seller.save();

    // Send seller approval notification email
    try {
      await NotificationService.sendSellerApprovalNotification(updatedSeller);
    } catch (emailError) {
      console.error('Failed to send seller approval notification:', emailError);
      // Don't fail the approval if email fails
    }

    res.json({
      message: 'Seller approved successfully',
      seller: updatedSeller
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    if (seller.role !== 'seller') {
      return res.status(400).json({ message: 'User is not a seller' });
    }

    seller.isSellerApproved = false;
    const updatedSeller = await seller.save();

    // Send seller rejection notification email
    try {
      await NotificationService.sendSellerRejectionNotification(updatedSeller);
    } catch (emailError) {
      console.error('Failed to send seller rejection notification:', emailError);
      // Don't fail the rejection if email fails
    }

    res.json({
      message: 'Seller application rejected',
      seller: updatedSeller
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    // Get user counts by role
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get active vs inactive users
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // Get recently registered users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Get approved vs pending sellers
    const approvedSellers = await User.countDocuments({
      role: 'seller',
      isSellerApproved: true
    });
    const pendingSellers = await User.countDocuments({
      role: 'seller',
      isSellerApproved: false
    });

    const stats = {
      byRole: {
        users: totalUsers,
        sellers: totalSellers,
        admins: totalAdmins
      },
      byStatus: {
        active: activeUsers,
        inactive: inactiveUsers
      },
      recentActivity: {
        recentUsers,
        approvedSellers,
        pendingSellers
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
