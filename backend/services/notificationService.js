const { sendEmail, sendBulkEmail } = require('../config/emailService');
const User = require('../models/User');
const Product = require('../models/Product');

class NotificationService {
  // Send order confirmation email
  static async sendOrderConfirmation(order, user) {
    try {
      const orderNumber = order._id.toString().slice(-8).toUpperCase();

      const orderData = {
        orderNumber,
        _id: order._id,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        items: order.orderItems.map(item => ({
          name: item.product?.name || 'Product',
          quantity: item.qty,
          price: item.price
        })),
        trackingNumber: order.trackingNumber
      };

      const userData = {
        name: user.name,
        email: user.email
      };

      const result = await sendEmail(
        user.email,
        'orderConfirmation',
        { orderData, userData }
      );

      return result;
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      return { success: false, error: error.message };
    }
  }

  // Send order status update email
  static async sendOrderStatusUpdate(order, user, statusChange) {
    try {
      const orderNumber = order._id.toString().slice(-8).toUpperCase();

      const orderData = {
        orderNumber,
        _id: order._id,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt
      };

      const userData = {
        name: user.name,
        email: user.email
      };

      const result = await sendEmail(
        user.email,
        'orderStatusUpdate',
        { orderData, userData, statusChange }
      );

      return result;
    } catch (error) {
      console.error('Failed to send order status update:', error);
      return { success: false, error: error.message };
    }
  }

  // Send payment confirmation email
  static async sendPaymentConfirmation(payment, order, user) {
    try {
      const orderNumber = order._id.toString().slice(-8).toUpperCase();

      const paymentData = {
        _id: payment._id,
        paymentMethod: payment.paymentMethod || 'Card',
        amount: payment.amount,
        currency: payment.currency || 'USD',
        transactionId: payment.transactionId,
        createdAt: payment.createdAt
      };

      const orderData = {
        orderNumber,
        _id: order._id,
        totalPrice: order.totalPrice,
        status: order.status
      };

      const userData = {
        name: user.name,
        email: user.email
      };

      const result = await sendEmail(
        user.email,
        'paymentConfirmation',
        { paymentData, orderData, userData }
      );

      return result;
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email to new users
  static async sendWelcomeEmail(user) {
    try {
      const userData = {
        name: user.name,
        email: user.email
      };

      const result = await sendEmail(
        user.email,
        'welcome',
        { userData }
      );

      return result;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send seller approval notification
  static async sendSellerApprovalNotification(user) {
    try {
      const userData = {
        name: user.name,
        email: user.email
      };

      const result = await sendEmail(
        user.email,
        'sellerApproval',
        { userData }
      );

      return result;
    } catch (error) {
      console.error('Failed to send seller approval notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send low stock alert to seller
  static async sendLowStockAlert(product, seller) {
    try {
      const productData = {
        _id: product._id,
        name: product.name,
        countInStock: product.countInStock,
        lowStockThreshold: product.lowStockThreshold,
        sku: product.sku
      };

      const userData = {
        name: seller.name,
        email: seller.email
      };

      const result = await sendEmail(
        seller.email,
        'lowStockAlert',
        { productData, userData }
      );

      return result;
    } catch (error) {
      console.error('Failed to send low stock alert:', error);
      return { success: false, error: error.message };
    }
  }

  // Send review verification notification
  static async sendReviewVerificationNotification(review, product, user) {
    try {
      const reviewData = {
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      };

      const productData = {
        _id: product._id,
        name: product.name
      };

      const userData = {
        name: user.name,
        email: user.email
      };

      const result = await sendEmail(
        user.email,
        'reviewVerified',
        { reviewData, productData, userData }
      );

      return result;
    } catch (error) {
      console.error('Failed to send review verification notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send newsletter subscription confirmation
  static async sendNewsletterWelcome(user) {
    try {
      const userData = {
        name: user.name,
        email: user.email
      };

      const result = await sendEmail(
        user.email,
        'newsletterWelcome',
        { userData }
      );

      return result;
    } catch (error) {
      console.error('Failed to send newsletter welcome:', error);
      return { success: false, error: error.message };
    }
  }

  // Send bulk newsletter emails
  static async sendNewsletterToSubscribers(subscribers, newsletterData) {
    try {
      const recipients = subscribers.map(user => ({
        email: user.email,
        name: user.name
      }));

      const userData = {
        name: 'Valued Customer', // Generic for bulk emails
        email: process.env.EMAIL_USER
      };

      const result = await sendBulkEmail(
        recipients,
        'newsletterWelcome',
        { userData, newsletterData }
      );

      return result;
    } catch (error) {
      console.error('Failed to send bulk newsletter:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = NotificationService;
