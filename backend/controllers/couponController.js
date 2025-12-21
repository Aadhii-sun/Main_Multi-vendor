const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get all coupons (admin only)
exports.getCoupons = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;

    let query = {};
    if (status === 'active') {
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      query.$or = [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } }
      ];
    } else if (status === 'expired') {
      query.$or = [
        { endDate: { $lt: new Date() } },
        { isActive: false }
      ];
    }

    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name email')
      .populate('applicableProducts', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Coupon.countDocuments(query);

    res.json({
      coupons,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
  }
};

// Create new coupon (admin only)
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      type,
      value,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      userLimit,
      applicableCategories,
      applicableProducts,
      excludedProducts,
      startDate,
      endDate
    } = req.body;

    // Validate coupon code format
    if (!/^[A-Z0-9]{6,12}$/.test(code)) {
      return res.status(400).json({
        message: 'Coupon code must be 6-12 characters, uppercase letters and numbers only'
      });
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code,
      name,
      description,
      type,
      value,
      minimumAmount: minimumAmount || 0,
      maximumDiscount,
      usageLimit,
      userLimit: userLimit || 1,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      excludedProducts: excludedProducts || [],
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      isActive: true,
      createdBy: req.user._id
    });

    const createdCoupon = await coupon.save();

    // Populate the response
    await createdCoupon.populate('createdBy', 'name email');
    await createdCoupon.populate('applicableProducts', 'name price');

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon: createdCoupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Failed to create coupon', error: error.message });
  }
};

// Update coupon (admin only)
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const {
      name,
      description,
      type,
      value,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      userLimit,
      applicableCategories,
      applicableProducts,
      excludedProducts,
      startDate,
      endDate,
      isActive
    } = req.body;

    // Update fields
    if (name) coupon.name = name;
    if (description) coupon.description = description;
    if (type) coupon.type = type;
    if (value) coupon.value = value;
    if (minimumAmount !== undefined) coupon.minimumAmount = minimumAmount;
    if (maximumDiscount !== undefined) coupon.maximumDiscount = maximumDiscount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (userLimit !== undefined) coupon.userLimit = userLimit;
    if (applicableCategories) coupon.applicableCategories = applicableCategories;
    if (applicableProducts) coupon.applicableProducts = applicableProducts;
    if (excludedProducts) coupon.excludedProducts = excludedProducts;
    if (startDate) coupon.startDate = new Date(startDate);
    if (endDate) coupon.endDate = new Date(endDate);
    if (isActive !== undefined) coupon.isActive = isActive;

    const updatedCoupon = await coupon.save();

    // Populate the response
    await updatedCoupon.populate('createdBy', 'name email');
    await updatedCoupon.populate('applicableProducts', 'name price');

    res.json({
      message: 'Coupon updated successfully',
      coupon: updatedCoupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ message: 'Failed to update coupon', error: error.message });
  }
};

// Delete coupon (admin only)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Coupon deleted successfully',
      deletedCouponId: req.params.id
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
  }
};

// Validate and apply coupon to order
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderItems, orderTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    // Find active coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } }
      ]
    }).populate('applicableProducts', 'name price category')
    .populate('excludedProducts', 'name price category');

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit exceeded' });
    }

    // Check minimum order amount
    if (orderTotal < coupon.minimumAmount) {
      return res.status(400).json({
        message: `Minimum order amount of $${coupon.minimumAmount} required to use this coupon`
      });
    }

    // Check if coupon applies to products in cart
    if (orderItems && orderItems.length > 0) {
      const productIds = orderItems.map(item => item.product);

      // Check excluded products
      const hasExcludedProduct = coupon.excludedProducts.some(
        product => productIds.includes(product._id.toString())
      );

      if (hasExcludedProduct) {
        return res.status(400).json({ message: 'Coupon not applicable to some items in your cart' });
      }

      // Check if coupon applies to specific products or categories
      if (coupon.applicableProducts.length > 0 || coupon.applicableCategories.length > 0) {
        const applicableProductIds = coupon.applicableProducts.map(p => p._id.toString());
        const applicableCategories = coupon.applicableCategories;

        const isApplicable = orderItems.some(item => {
          const product = item.product;
          return applicableProductIds.includes(product._id.toString()) ||
                 applicableCategories.includes(product.category);
        });

        if (!isApplicable) {
          return res.status(400).json({ message: 'Coupon not applicable to items in your cart' });
        }
      }
    }

    // Calculate discount
    let discount = 0;
    let discountType = 'none';

    switch (coupon.type) {
      case 'percentage':
        discount = (orderTotal * coupon.value) / 100;
        if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
          discount = coupon.maximumDiscount;
        }
        discountType = 'percentage';
        break;

      case 'fixed_amount':
        discount = Math.min(coupon.value, orderTotal);
        discountType = 'fixed';
        break;

      case 'free_shipping':
        discount = 0; // Free shipping - discount calculated separately
        discountType = 'shipping';
        break;

      case 'buy_one_get_one':
        // BOGO logic - get cheapest item free
        const sortedItems = orderItems.sort((a, b) => a.price - b.price);
        discount = sortedItems.length > 1 ? sortedItems[0].price : 0;
        discountType = 'bogo';
        break;
    }

    const finalTotal = orderTotal - discount;

    res.json({
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        discount,
        discountType,
        finalTotal
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Failed to validate coupon', error: error.message });
  }
};

// Get active coupons for users
exports.getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } }
      ]
    })
    .select('code name description type value minimumAmount applicableCategories')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(coupons);
  } catch (error) {
    console.error('Get active coupons error:', error);
    res.status(500).json({ message: 'Failed to fetch active coupons', error: error.message });
  }
};
