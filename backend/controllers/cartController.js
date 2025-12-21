const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image countInStock category');

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.countInStock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > product.countInStock) {
        return res.status(400).json({ message: 'Insufficient stock for requested quantity' });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name price image countInStock category');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Check if product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.countInStock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find and update item
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Update price in case it changed

    await cart.save();
    await cart.populate('items.product', 'name price image countInStock category');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product', 'name price image countInStock category');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cart summary (for checkout)
exports.getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image countInStock');

    if (!cart || cart.items.length === 0) {
      return res.json({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isEmpty: true
      });
    }

    // Check stock availability for all items
    const outOfStockItems = [];
    const availableItems = [];

    for (const item of cart.items) {
      if (item.quantity > item.product.countInStock) {
        outOfStockItems.push({
          productId: item.product._id,
          name: item.product.name,
          requested: item.quantity,
          available: item.product.countInStock
        });
      } else {
        availableItems.push(item);
      }
    }

    res.json({
      items: availableItems,
      totalItems: availableItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: availableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      isEmpty: availableItems.length === 0,
      outOfStockItems: outOfStockItems.length > 0 ? outOfStockItems : undefined
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate coupon for cart
exports.validateCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price category');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Find active coupon
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
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

    // Calculate cart total
    const cartTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check minimum order amount
    if (cartTotal < coupon.minimumAmount) {
      return res.status(400).json({
        message: `Minimum order amount of $${coupon.minimumAmount} required to use this coupon`
      });
    }

    // Check if coupon applies to cart items
    const productIds = cart.items.map(item => item.product._id.toString());
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

      const isApplicable = cart.items.some(item => {
        const product = item.product;
        return applicableProductIds.includes(product._id.toString()) ||
               applicableCategories.includes(product.category);
      });

      if (!isApplicable) {
        return res.status(400).json({ message: 'Coupon not applicable to items in your cart' });
      }
    }

    // Calculate discount
    let discount = 0;

    switch (coupon.type) {
      case 'percentage':
        discount = (cartTotal * coupon.value) / 100;
        if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
          discount = coupon.maximumDiscount;
        }
        break;
      case 'fixed_amount':
        discount = Math.min(coupon.value, cartTotal);
        break;
      case 'free_shipping':
        discount = 0; // Free shipping - handled separately
        break;
      case 'buy_one_get_one':
        const sortedItems = cart.items.sort((a, b) => a.price - b.price);
        discount = sortedItems.length > 1 ? sortedItems[0].price : 0;
        break;
    }

    const finalTotal = cartTotal - discount;

    res.json({
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        discount,
        finalTotal
      },
      cartTotal,
      savings: discount
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Failed to validate coupon', error: error.message });
  }
};
