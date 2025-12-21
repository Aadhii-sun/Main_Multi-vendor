const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' })
      .populate('sellerProfile')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSellerById = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id)
      .populate('sellerProfile')
      .select('-password');

    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const isSelf = req.user._id.toString() === seller._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to view this seller' });
    }

    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    user.isSellerApproved = true;
    const updatedUser = await user.save();

    // Send approval notification email
    try {
      const NotificationService = require('../services/notificationService');
      await NotificationService.sendSellerApprovalNotification(updatedUser);
    } catch (emailError) {
      console.error('Failed to send seller approval notification:', emailError);
    }

    res.json({
      message: 'Seller approved successfully',
      seller: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Change role back to user
    user.role = 'user';
    user.isSellerApproved = false;
    user.sellerProfile = undefined; // Remove seller profile reference

    // Remove seller profile if exists
    if (user.sellerProfile) {
      await SellerProfile.findByIdAndDelete(user.sellerProfile);
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Seller application rejected',
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
    .populate('sellerProfile')
    .select('-password')
    .sort({ createdAt: -1 });

    res.json(pendingSellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovedSellers = async (req, res) => {
  try {
    const approvedSellers = await User.find({
      role: 'seller',
      isSellerApproved: true
    })
    .populate('sellerProfile')
    .select('-password')
    .sort({ createdAt: -1 });

    res.json(approvedSellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerAsSeller = async (req, res) => {
  try {
    const { businessName, businessDescription, contactInfo } = req.body;

    // Check if user is already a seller
    if (req.user.role === 'seller') {
      return res.status(400).json({ message: 'You are already registered as a seller' });
    }

    // Create seller profile
    const sellerProfile = new SellerProfile({
      user: req.user._id,
      businessName,
      businessDescription,
      contactInfo,
      approved: false // Requires admin approval
    });

    const createdProfile = await sellerProfile.save();

    // Update user role to seller (but not approved yet)
    req.user.role = 'seller';
    req.user.isSellerApproved = false;
    req.user.sellerProfile = createdProfile._id;
    await req.user.save();

    await createdProfile.populate('user', 'name email');

    res.status(201).json({
      message: 'Seller application submitted successfully. Please wait for admin approval.',
      profile: createdProfile
    });
  } catch (error) {
    console.error('Register as seller error:', error);
    res.status(500).json({ message: 'Failed to register as seller', error: error.message });
  }
};

// Get seller sales analytics
exports.getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.params.id || req.user._id;
    const { startDate, endDate } = req.query;

    // Verify seller access
    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const isSelf = req.user._id.toString() === sellerId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to view this seller analytics' });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get all products by this seller
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id price originalPrice');
    const productIds = sellerProducts.map(p => p._id);

    // Get all orders containing seller's products
    const orders = await Order.find({
      ...dateFilter,
      'orderItems.product': { $in: productIds },
      status: { $ne: 'cancelled' }
    })
      .populate('orderItems.product', 'name price originalPrice seller')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Calculate sales metrics
    let totalSales = 0;
    let totalRevenue = 0;
    let totalCost = 0;
    let totalOrders = 0;
    let totalItemsSold = 0;

    // Process each order
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const product = item.product;
        if (product && product.seller && product.seller.toString() === sellerId.toString()) {
          const itemRevenue = item.price * item.qty;
          const itemCost = (product.originalPrice || product.price * 0.6) * item.qty; // Assume 40% margin if no originalPrice
          
          totalSales += itemRevenue;
          totalCost += itemCost;
          totalItemsSold += item.qty;
        }
      });
      if (order.orderItems.some(item => 
        item.product?.seller?.toString() === sellerId.toString()
      )) {
        totalOrders += 1;
      }
    });

    totalRevenue = totalSales;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // Get orders by status
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
    };

    // Get recent orders (last 10)
    const recentOrders = orders.slice(0, 10).map(order => ({
      _id: order._id,
      orderNumber: order._id.toString().slice(-8).toUpperCase(),
      customer: order.user?.name || 'Unknown',
      total: order.orderItems
        .filter(item => item.product?.seller?.toString() === sellerId.toString())
        .reduce((sum, item) => sum + (item.price * item.qty), 0),
      status: order.status,
      createdAt: order.createdAt,
      trackingNumber: order.trackingNumber
    }));

    // Get top selling products
    const productSales = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const product = item.product;
        if (product && product.seller && product.seller.toString() === sellerId.toString()) {
          if (!productSales[product._id]) {
            productSales[product._id] = {
              productId: product._id,
              productName: product.name,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[product._id].quantity += item.qty;
          productSales[product._id].revenue += item.price * item.qty;
        }
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        isSellerApproved: seller.isSellerApproved
      },
      summary: {
        totalSales,
        totalRevenue,
        totalCost,
        profit,
        profitMargin: profitMargin.toFixed(2),
        totalOrders,
        totalItemsSold
      },
      ordersByStatus,
      recentOrders,
      topProducts,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
  } catch (error) {
    console.error('Get seller analytics error:', error);
    res.status(500).json({ message: 'Failed to get seller analytics', error: error.message });
  }
};
