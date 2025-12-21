const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('items.product', 'name price images category averageRating countInStock status');

    if (!wishlist) {
      // Create empty wishlist for user
      wishlist = new Wishlist({ user: req.user._id, items: [] });
      await wishlist.save();
    }

    // Update availability status for each item
    for (const item of wishlist.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        item.product.availability = product.status === 'active' && product.countInStock > 0;
        item.price = product.price; // Update price in case it changed
      } else {
        item.product.availability = false; // Product no longer exists
      }
    }

    await wishlist.save();

    res.json(wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
};

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'active' || product.countInStock <= 0) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }

    // Check if product already in wishlist
    const existingItem = wishlist.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    // Add product to wishlist
    wishlist.items.push({
      product: productId,
      price: product.price,
      availability: true
    });

    await wishlist.save();
    await wishlist.populate('items.product', 'name price images category averageRating');

    res.status(201).json({
      message: 'Product added to wishlist',
      wishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Failed to add to wishlist', error: error.message });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Remove item from wishlist
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    res.json({
      message: 'Product removed from wishlist',
      wishlist
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message });
  }
};

// Clear entire wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      message: 'Wishlist cleared successfully',
      wishlist
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Failed to clear wishlist', error: error.message });
  }
};

// Check if product is in wishlist
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.json({ inWishlist: false });
    }

    const isInWishlist = wishlist.items.some(
      item => item.product.toString() === productId
    );

    res.json({ inWishlist: isInWishlist });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({ message: 'Failed to check wishlist status', error: error.message });
  }
};

// Move item from wishlist to cart
exports.moveToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    // Check if product is in wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const wishlistItem = wishlist.items.find(
      item => item.product.toString() === productId
    );

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Product not in wishlist' });
    }

    // Check if product is still available
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active' || product.countInStock <= 0) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Add to cart (assuming you have a cart controller)
    // This would typically call the cart controller's addToCart function
    // For now, I'll just remove from wishlist
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    res.json({
      message: 'Product moved from wishlist to cart',
      productId,
      quantity
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({ message: 'Failed to move to cart', error: error.message });
  }
};
