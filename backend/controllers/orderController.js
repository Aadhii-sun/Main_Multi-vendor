const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const NotificationService = require('../services/notificationService');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

// Checkout from cart - creates order from cart items
exports.checkoutFromCart = async (req, res) => {
  try {
    const { couponCode, shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price countInStock');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock availability
    const outOfStockItems = [];
    const validItems = [];

    for (const item of cart.items) {
      if (item.quantity > item.product.countInStock) {
        outOfStockItems.push({
          productId: item.product._id,
          name: item.product.name,
          requested: item.quantity,
          available: item.product.countInStock
        });
      } else {
        validItems.push({
          product: item.product._id,
          qty: item.quantity,
          price: item.product.price
        });
      }
    }

    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        message: 'Some items are out of stock',
        outOfStockItems
      });
    }

    // Calculate total price
    let totalPrice = validItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Apply coupon if provided
    let appliedCoupon = null;
    let discount = 0;

    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true,
          startDate: { $lte: new Date() },
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: new Date() } }
          ]
        });

        if (coupon) {
          // Check usage limits
          if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit exceeded' });
          }

          // Check if coupon applies to cart items
          const productIds = validItems.map(item => item.product.toString());
          const hasExcludedProduct = coupon.excludedProducts.some(
            productId => productIds.includes(productId.toString())
          );

          if (hasExcludedProduct) {
            return res.status(400).json({ message: 'Coupon not applicable to some items in your cart' });
          }

          // Calculate discount
          switch (coupon.type) {
            case 'percentage':
              discount = (totalPrice * coupon.value) / 100;
              if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
                discount = coupon.maximumDiscount;
              }
              break;
            case 'fixed_amount':
              discount = Math.min(coupon.value, totalPrice);
              break;
            case 'free_shipping':
              discount = 0; // Free shipping - handled separately
              break;
            case 'buy_one_get_one':
              const sortedItems = validItems.sort((a, b) => a.price - b.price);
              discount = sortedItems.length > 1 ? sortedItems[0].price : 0;
              break;
          }

          appliedCoupon = {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discount
          };

          totalPrice -= discount;

          // Update coupon usage count
          coupon.usageCount += 1;
          await coupon.save();

        } else {
          return res.status(400).json({ message: 'Invalid or expired coupon code' });
        }
      } catch (couponError) {
        console.error('Coupon validation error:', couponError);
        return res.status(400).json({ message: 'Error validating coupon' });
      }
    }

    // Create order from cart
    const order = new Order({
      user: req.user._id,
      orderItems: validItems,
      totalPrice,
      appliedCoupon,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      status: 'pending'
    });

    const createdOrder = await order.save();

    // Update product stock
    for (const item of validItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.qty }
      });
    }

    // Clear the cart after successful order creation
    await Cart.findByIdAndUpdate(cart._id, {
      items: [],
      totalItems: 0,
      totalPrice: 0
    });

    // Populate the created order for response
    await createdOrder.populate('orderItems.product', 'name price image');
    await createdOrder.populate('user', 'name email');

    // Send order confirmation email
    try {
      await NotificationService.sendOrderConfirmation(createdOrder, createdOrder.user);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      message: 'Order created successfully from cart',
      order: createdOrder,
      discount: discount,
      finalTotal: totalPrice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create order manually (for direct purchases)
exports.createOrder = async (req, res) => {
  const { orderItems, totalPrice, shippingAddress, couponCode, paymentMethod } = req.body;
  try {
    // Validate products and stock
    const validatedItems = [];
    let calculatedTotal = 0;

    for (const item of orderItems) {
      // Handle different ID formats
      let productId = item.product || item.productId || item.id;
      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required for all items' });
      }

      // Convert to string
      productId = String(productId);

      // Check if productId is a valid MongoDB ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
      
      // Try to find product by ID first (only if it looks like ObjectId)
      let product = null;
      if (isValidObjectId) {
        product = await Product.findById(productId);
      }
      
      // If not found and ID doesn't look like ObjectId, or if findById failed, try finding by name
      if (!product && item.name) {
        // Escape special regex characters in product name
        const escapedName = item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Try exact match first
        product = await Product.findOne({
          name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
          status: 'active'
        });
        
        // If no exact match, try partial match
        if (!product) {
          product = await Product.findOne({
            name: { $regex: new RegExp(escapedName, 'i') },
            status: 'active'
          });
        }
        
        // If still not found and we have price, try matching name and price
        if (!product && item.price) {
          product = await Product.findOne({
            name: { $regex: new RegExp(escapedName, 'i') },
            price: { $gte: item.price * 0.99, $lte: item.price * 1.01 }, // Allow 1% price variance
            status: 'active'
          });
        }
        
        if (product) {
          console.log(`Found product by name: "${item.name}" -> ${product._id}`);
        }
      }
      
      // If still not found, try finding by SKU
      if (!product && item.sku) {
        product = await Product.findOne({ sku: item.sku, status: 'active' });
      }

      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.name || productId}. Please ensure the product exists in the database.`,
          productId: productId,
          itemName: item.name,
          isValidObjectId: isValidObjectId
        });
      }

      const quantity = item.qty || item.quantity || 1;
      if (product.countInStock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.countInStock}, Requested: ${quantity}`
        });
      }

      validatedItems.push({
        product: product._id,
        qty: quantity,
        price: product.price
      });

      calculatedTotal += product.price * quantity;
    }

    // Apply coupon if provided
    let appliedCoupon = null;
    let discount = 0;
    let finalTotalPrice = totalPrice || calculatedTotal;

    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true,
          startDate: { $lte: new Date() },
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: new Date() } }
          ]
        });

        if (coupon) {
          if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit exceeded' });
          }

          if (finalTotalPrice < coupon.minimumAmount) {
            return res.status(400).json({
              message: `Minimum order amount of $${coupon.minimumAmount} required to use this coupon`
            });
          }

          switch (coupon.type) {
            case 'percentage':
              discount = (finalTotalPrice * coupon.value) / 100;
              if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
                discount = coupon.maximumDiscount;
              }
              break;
            case 'fixed_amount':
              discount = Math.min(coupon.value, finalTotalPrice);
              break;
            case 'free_shipping':
              discount = 0;
              break;
            case 'buy_one_get_one':
              const sortedItems = validatedItems.sort((a, b) => a.price - b.price);
              discount = sortedItems.length > 1 ? sortedItems[0].price : 0;
              break;
          }

          appliedCoupon = {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discount
          };

          finalTotalPrice -= discount;
          coupon.usageCount += 1;
          await coupon.save();
        } else {
          return res.status(400).json({ message: 'Invalid or expired coupon code' });
        }
      } catch (couponError) {
        console.error('Coupon validation error:', couponError);
        return res.status(400).json({ message: 'Error validating coupon' });
      }
    }

    // Validate total price if provided
    if (totalPrice && Math.abs(totalPrice - calculatedTotal) > 0.01) {
      console.warn(`Total price mismatch: provided=${totalPrice}, calculated=${calculatedTotal}`);
      // Use calculated total for security
      finalTotalPrice = calculatedTotal - discount;
    }

    const order = new Order({
      user: req.user._id,
      orderItems: validatedItems,
      totalPrice: finalTotalPrice,
      appliedCoupon,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      status: 'pending'
    });

    const createdOrder = await order.save();

    // Update stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.qty }
      });
    }

    await createdOrder.populate('orderItems.product', 'name price image');
    await createdOrder.populate('user', 'name email');

    // Send order confirmation email
    try {
      await NotificationService.sendOrderConfirmation(createdOrder, req.user);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: createdOrder,
      discount: discount,
      finalTotal: finalTotalPrice
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOrdersForUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('orderItems.product', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').populate('orderItems.product', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status filter' });
    }

    const orders = await Order.find({ status })
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price')
      .sort({ updatedAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow cancellation if order is not already delivered or cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();
    res.json({
      message: 'Order cancelled successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { orderItems, totalPrice, status } = req.body;

    // Only allow editing if order is not delivered
    if (order.status === 'delivered') {
      return res.status(400).json({
        message: 'Cannot edit delivered order'
      });
    }

    if (orderItems) order.orderItems = orderItems;
    if (totalPrice) order.totalPrice = totalPrice;
    if (status && ['pending','confirmed','shipped','delivered','cancelled'].includes(status)) {
      order.status = status;
    }

    const updatedOrder = await order.save();
    await updatedOrder.populate('user', 'name email');
    await updatedOrder.populate('orderItems.product', 'name price');

    res.json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const isAdmin = req.user.role === 'admin';
    const orderOwnerId = order.user?._id ? order.user._id.toString() : order.user?.toString();
    const isOwner = orderOwnerId === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    order.status = status;

    // Add status change notes if provided
    if (notes) {
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status,
        notes,
        changedBy: req.user._id,
        changedAt: new Date()
      });
    }

    // If order is being delivered, restore stock for cancelled items
    if (status === 'cancelled' && order.status !== 'cancelled') {
      // Restore stock for cancelled order
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { countInStock: item.qty }
        });
      }
    }

    // If order is being reactivated from cancelled, reduce stock
    if (status !== 'cancelled' && order.status === 'cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { countInStock: -item.qty }
        });
      }
    }

    const updatedOrder = await order.save();

    // Populate for response
    await updatedOrder.populate('user', 'name email');
    await updatedOrder.populate('orderItems.product', 'name price');

    // Send order status update email
    try {
      const statusChange = {
        previousStatus: order.status, // Before the update
        newStatus: status,
        notes: notes,
        changedAt: new Date(),
        changedBy: req.user._id
      };

      await NotificationService.sendOrderStatusUpdate(updatedOrder, updatedOrder.user, statusChange);
    } catch (emailError) {
      console.error('Failed to send order status update email:', emailError);
      // Don't fail the status update if email fails
    }

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};
