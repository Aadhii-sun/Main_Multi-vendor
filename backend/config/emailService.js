const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const config = require('./env');

// Determine which email service to use
const useSendGrid = !!process.env.SENDGRID_API_KEY;
const useSMTP = !useSendGrid && config.email.user && config.email.pass;

// Initialize SendGrid if API key is available
if (useSendGrid) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid email service initialized');
} else if (useSMTP) {
  console.log('✅ SMTP email service will be used (fallback mode)');
} else {
  console.warn('⚠️  No email service configured. OTP codes will be logged to console.');
}

// SMTP transporter (fallback for local development)
const createSMTPTransporter = () => {
  if (!config.email.user || !config.email.pass) {
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.pass
      },
      tls: {
        rejectUnauthorized: false // Only for development
      }
    });

    // Verify connection configuration
    transporter.verify((error) => {
      if (error) {
        console.error('Error verifying SMTP configuration:', error);
      } else {
        console.log('SMTP server is ready to send messages');
      }
    });

    return transporter;
  } catch (error) {
    console.error('Failed to create SMTP transporter:', error);
    return null;
  }
};

let smtpTransporterInstance;

const getSMTPTransporter = () => {
  if (!smtpTransporterInstance) {
    smtpTransporterInstance = createSMTPTransporter();
  }
  return smtpTransporterInstance;
};

// Utilities for safe rendering
const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return amount.toFixed(2);
};

const formatDate = (value, fallback = new Date()) => {
  try {
    return new Date(value || fallback).toLocaleDateString();
  } catch (error) {
    return new Date(fallback).toLocaleDateString();
  }
};

const formatDateTime = (value, fallback = new Date()) => {
  try {
    return new Date(value || fallback).toLocaleString();
  } catch (error) {
    return new Date(fallback).toLocaleString();
  }
};

const pluralize = (word, count) => `${word}${count === 1 ? '' : 's'}`;

// Email templates
const emailTemplates = {
  // OTP Authentication templates
  otpLogin: ({ otp, name }) => ({
    subject: 'Your Login OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Login Verification</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Your one-time password (OTP) for login is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; padding: 15px 25px; background-color: #f8f9fa; border-radius: 8px; border: 2px solid #007bff;">
            ${otp || '------'}
          </span>
        </div>
        <p><strong>Important:</strong></p>
        <ul>
          <li>This OTP will expire in 10 minutes</li>
          <li>Do not share this code with anyone</li>
          <li>If you didn't request this login, please ignore this email</li>
        </ul>
        <p>Best regards,<br>Your E-commerce Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  otpVerification: ({ name }) => ({
    subject: 'Email Verification Successful',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #28a745; text-align: center;">✅ Verification Successful</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Your email has been successfully verified and you are now logged in.</p>
        <p>Welcome to our platform!</p>
        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `
  }),

  // Order confirmations
  orderConfirmation: ({ orderData = {}, userData = {} }) => {
    const items = Array.isArray(orderData.items) ? orderData.items : [];
    return {
      subject: `Order Confirmation - #${orderData.orderNumber || 'ORDER'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #28a745; text-align: center; margin-bottom: 30px;">✅ Order Confirmed!</h2>

            <p>Hi ${userData.name || 'there'},</p>
            <p>Thank you for your order! We're excited to confirm that your order has been received and is being processed.</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Order Details</h3>
              <p><strong>Order Number:</strong> #${orderData.orderNumber || 'ORDER'}</p>
              <p><strong>Order Date:</strong> ${formatDate(orderData.createdAt)}</p>
              <p><strong>Total Amount:</strong> $${formatCurrency(orderData.totalPrice)}</p>
              <p><strong>Status:</strong> ${orderData.status || 'Processing'}</p>
            </div>

            <h3>Items Ordered:</h3>
            ${items.length ? items.map(item => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <div style="display: flex; justify-content: space-between;">
                  <div>
                    <strong>${item.name || 'Product'}</strong><br>
                    Quantity: ${item.quantity ?? item.qty ?? 1}<br>
                    Price: $${formatCurrency(item.price)}
                  </div>
                  <div style="text-align: right;">
                    <strong>$${formatCurrency((item.price || 0) * (item.quantity ?? item.qty ?? 1))}</strong>
                  </div>
                </div>
              </div>
            `).join('') : '<p>No items found for this order.</p>'}

            <div style="margin: 30px 0;">
              <h3>Shipping Information</h3>
              <p>Your order will be processed within 1-2 business days. You\'ll receive tracking information once your order ships.</p>
              ${orderData.trackingNumber ? `<p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.clientUrl || process.env.CLIENT_URL || ''}/orders/${orderData._id || ''}"
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Order Details
              </a>
            </div>

            <p>Questions about your order? Contact our customer support team.</p>
            <p>Best regards,<br>Your E-commerce Team</p>
          </div>
        </div>
      `
    };
  },

  // Order status updates
  orderStatusUpdate: ({ orderData = {}, userData = {}, statusChange = {} }) => ({
    subject: `Order Update - #${orderData.orderNumber || 'ORDER'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #007bff; text-align: center; margin-bottom: 30px;">📦 Order Status Update</h2>

          <p>Hi ${userData.name || 'there'},</p>
          <p>Your order status has been updated:</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order Number:</strong> #${orderData.orderNumber || 'ORDER'}</p>
            <p><strong>Previous Status:</strong> ${statusChange.previousStatus || 'Processing'}</p>
            <p><strong>New Status:</strong> ${statusChange.newStatus || orderData.status || 'Updated'}</p>
            ${statusChange.notes ? `<p><strong>Notes:</strong> ${statusChange.notes}</p>` : ''}
            <p><strong>Updated:</strong> ${formatDateTime(statusChange.changedAt)}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.clientUrl || process.env.CLIENT_URL || ''}/orders/${orderData._id || ''}"
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Track Your Order
            </a>
          </div>

          <p>Best regards,<br>Your E-commerce Team</p>
        </div>
      </div>
    `
  }),

  // Payment confirmation
  paymentConfirmation: ({ paymentData = {}, orderData = {}, userData = {} }) => ({
    subject: `Payment Confirmed - #${orderData.orderNumber || 'ORDER'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #28a745; text-align: center; margin-bottom: 30px;">💳 Payment Confirmed</h2>

          <p>Hi ${userData.name || 'there'},</p>
          <p>Your payment has been successfully processed! Your order is now confirmed.</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Payment Details</h3>
            <p><strong>Order Number:</strong> #${orderData.orderNumber || 'ORDER'}</p>
            <p><strong>Payment Method:</strong> ${paymentData.paymentMethod || 'Card'}</p>
            <p><strong>Amount Paid:</strong> $${formatCurrency(orderData.totalPrice)}</p>
            <p><strong>Transaction ID:</strong> ${paymentData.transactionId || paymentData._id || 'N/A'}</p>
            <p><strong>Payment Date:</strong> ${formatDate(paymentData.createdAt)}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.clientUrl || process.env.CLIENT_URL || ''}/orders/${orderData._id || ''}"
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p>Best regards,<br>Your E-commerce Team</p>
        </div>
      </div>
    `
  }),

  // Welcome email for new users
  welcome: ({ userData = {}, name }) => ({
    subject: 'Welcome to Our E-commerce Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #007bff; text-align: center; margin-bottom: 30px;">🎉 Welcome to Our Store!</h2>

          <p>Hi ${userData.name || name || 'there'},</p>
          <p>Welcome to our e-commerce platform! We're excited to have you as a customer.</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">What's Next?</h3>
            <ul>
              <li>Browse our product catalog</li>
              <li>Add items to your cart</li>
              <li>Save products to your wishlist</li>
              <li>Track your orders in real-time</li>
              <li>Leave reviews for products you've purchased</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.clientUrl || process.env.CLIENT_URL || ''}/products"
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
              Browse Products
            </a>
            <a href="${config.clientUrl || process.env.CLIENT_URL || ''}/account"
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
              My Account
            </a>
          </div>

          <p>Best regards,<br>Your E-commerce Team</p>
        </div>
      </div>
    `
  }),

  // Password reset email
  passwordReset: ({ resetUrl, userData = {} }) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #dc3545; text-align: center; margin-bottom: 30px;">🔐 Password Reset</h2>

          <p>Hi ${userData.name || 'there'},</p>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl || '#'}"
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link will expire in 10 minutes</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>For security, never share this link with anyone</li>
            </ul>
          </div>

          <p>Best regards,<br>Your E-commerce Team</p>
        </div>
      </div>
    `
  }),

  // Seller approval notification
  sellerApproval: ({ userData = {} }) => ({
    subject: 'Congratulations! Your Seller Application Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #28a745; text-align: center; margin-bottom: 30px;">🎉 Seller Application Approved!</h2>

          <p>Hi ${userData.name || 'there'},</p>
          <p>Congratulations! Your seller application has been approved. You can now start selling on our platform.</p>

          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #155724;">What's Next?</h3>
            <ul>
              <li>Complete your seller profile</li>
              <li>Add your first products</li>
              <li>Set up payment information</li>
              <li>Start receiving orders!</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.clientUrl || process.env.CLIENT_URL || ''}/seller/dashboard"
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
              Seller Dashboard
            </a>
            <a href="${config.clientUrl || process.env.CLIENT_URL || ''}/seller/products/add"
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
              Add Products
            </a>
          </div>

          <p>Best regards,<br>Your E-commerce Team</p>
        </div>
      </div>
    `
  }),

  // Low stock alert for sellers
  lowStockAlert: ({ productData = {}, userData = {} }) => ({
    subject: `Low Stock Alert: ${productData.name || 'Product'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #ffc107; text-align: center; margin-bottom: 30px;">⚠️ Low Stock Alert</h2>

          <p>Hi ${userData.name || 'there'},</p>
          <p>One of your products is running low on stock:</p>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0; color: #856404;">Product Details</h3>
            <p><strong>Product:</strong> ${productData.name || 'Product'}</p>
            <p><strong>Current Stock:</strong> ${productData.countInStock ?? 0} ${pluralize('unit', productData.countInStock ?? 0)}</p>
            <p><strong>Low Stock Threshold:</strong> ${productData.lowStockThreshold ?? 0} ${pluralize('unit', productData.lowStockThreshold ?? 0)}</p>
            <p><strong>SKU:</strong> ${productData.sku || 'N/A'}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.clientUrl || process.env.CLIENT_URL || ''}/seller/products/${productData._id || ''}/edit"
               style="background-color: #ffc107; color: #212529; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Update Stock
            </a>
          </div>

          <p>Best regards,<br>Your E-commerce Team</p>
        </div>
      </div>
    `
  }),

  // Review verification notification
  reviewVerified: ({ reviewData = {}, productData = {}, userData = {} }) => {
    const rating = Number(reviewData.rating || 0);
    const filledStars = Math.max(0, Math.min(5, Math.round(rating)));
    return {
      subject: 'Your Review Has Been Verified',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #28a745; text-align: center; margin-bottom: 30px;">✅ Review Verified</h2>

            <p>Hi ${userData.name || 'there'},</p>
            <p>Thank you for your review! It has been verified and published on our platform.</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Review Details</h3>
              <p><strong>Product:</strong> ${productData.name || 'Product'}</p>
              <p><strong>Rating:</strong> ${'⭐'.repeat(filledStars)}${'☆'.repeat(5 - filledStars)}</p>
              <p><strong>Comment:</strong> "${reviewData.comment || ''}"</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.clientUrl || process.env.CLIENT_URL || ''}/products/${productData._id || ''}"
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Product
              </a>
            </div>

            <p>Thank you for helping other customers make informed decisions!</p>
            <p>Best regards,<br>Your E-commerce Team</p>
          </div>
        </div>
      `
    };
  },

  // Newsletter subscription confirmation
  newsletterWelcome: ({ userData = {}, newsletterData = {} }) => ({
    subject: newsletterData.subject || 'Welcome to Our Newsletter!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #007bff; text-align: center; margin-bottom: 30px;">📧 Newsletter Subscription</h2>

          <p>Hi ${userData.name || 'there'},</p>
          <p>${newsletterData.intro || "Welcome to our newsletter! You'll be the first to know about:"}</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <ul>
              ${(newsletterData.bullets || [
                '🆕 New product launches',
                '💰 Exclusive discounts and offers',
                '🎁 Special promotions',
                '📦 Flash sales and limited-time deals',
                '📰 Latest trends and tips'
              ]).map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>

          <p>${newsletterData.footer || 'You can unsubscribe at any time using the link in our emails.'}</p>
          <p>Best regards,<br>Your E-commerce Team</p>
        </div>
      </div>
    `
  })
};

// Send email function with enhanced error handling
const sendEmail = async (to, template, data = {}, options = {}) => {
  try {
    const buildTemplate = emailTemplates[template];
    if (!buildTemplate) {
      const error = `Unknown email template: ${template}`;
      console.error(error);
      return { success: false, error };
    }

    const emailContent = buildTemplate(data);
    const { subject, from, ...mailOverrides } = options;

    const emailSubject = subject || emailContent.subject;
    const emailHtml = emailContent.html;
    const fromEmail = from || config.email.user || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
    const fromName = process.env.SENDGRID_FROM_NAME || 'E-commerce Team';

    // Use SendGrid if available (preferred for production/Render)
    if (useSendGrid) {
      try {
        const msg = {
          to,
          from: {
            email: fromEmail,
            name: fromName
          },
          subject: emailSubject,
          html: emailHtml,
          ...mailOverrides
        };

        const response = await sgMail.send(msg);
        console.log('✅ Email sent successfully via SendGrid:', response[0]?.headers?.['x-message-id'] || 'sent');
        return { 
          success: true, 
          messageId: response[0]?.headers?.['x-message-id'] || 'sent',
          provider: 'SendGrid'
        };
      } catch (sgError) {
        console.error('❌ SendGrid email sending failed:', sgError.message);
        // If SendGrid fails, fall back to SMTP if available
        if (useSMTP) {
          console.log('🔄 Falling back to SMTP...');
        } else {
          return { success: false, error: sgError.message, provider: 'SendGrid' };
        }
      }
    }

    // Fallback to SMTP (for local development)
    if (useSMTP) {
      const transporter = getSMTPTransporter();
      if (!transporter) {
        return { success: false, error: 'SMTP transporter not configured' };
      }

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject: emailSubject,
        html: emailHtml,
        ...mailOverrides
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully via SMTP:', info.messageId);
      return { success: true, messageId: info.messageId, provider: 'SMTP' };
    }

    // No email service configured - return error
    return { success: false, error: 'No email service configured (SendGrid or SMTP)' };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    if (useSMTP) {
      smtpTransporterInstance = null; // Reset transporter so next call can attempt to re-create it
    }
    return { success: false, error: error.message };
  }
};

// Bulk email function for newsletters
const sendBulkEmail = async (recipients, template, data = {}, options = {}) => {
  try {
    const buildTemplate = emailTemplates[template];
    if (!buildTemplate) {
      const error = `Unknown email template: ${template}`;
      console.error(error);
      return { success: false, error };
    }

    const emailContent = buildTemplate(data);
    const { subject, from, delayMs = 1000, ...mailOverrides } = options;
    const fromEmail = from || config.email.user || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
    const fromName = process.env.SENDGRID_FROM_NAME || 'E-commerce Team';

    const results = [];

    // Use SendGrid for bulk emails if available
    if (useSendGrid) {
      for (const recipient of recipients) {
        try {
          const msg = {
            to: recipient.email,
            from: {
              email: fromEmail,
              name: fromName
            },
            subject: subject || emailContent.subject,
            html: emailContent.html,
            ...mailOverrides
          };

          const response = await sgMail.send(msg);
          results.push({ 
            email: recipient.email, 
            success: true, 
            messageId: response[0]?.headers?.['x-message-id'] || 'sent' 
          });

          if (delayMs) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        } catch (error) {
          console.error(`Failed to send email to ${recipient.email}:`, error.message);
          results.push({ email: recipient.email, success: false, error: error.message });
        }
      }
    } else if (useSMTP) {
      // Fallback to SMTP
      const transporter = getSMTPTransporter();
      if (!transporter) {
        return { success: false, error: 'SMTP transporter not configured' };
      }

      for (const recipient of recipients) {
        try {
          const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: recipient.email,
            subject: subject || emailContent.subject,
            html: emailContent.html,
            ...mailOverrides
          };

          const info = await transporter.sendMail(mailOptions);
          results.push({ email: recipient.email, success: true, messageId: info.messageId });

          if (delayMs) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        } catch (error) {
          console.error(`Failed to send email to ${recipient.email}:`, error.message);
          results.push({ email: recipient.email, success: false, error: error.message });
        }
      }
    } else {
      return { success: false, error: 'No email service configured (SendGrid or SMTP)' };
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Bulk email completed: ${successCount}/${recipients.length} sent successfully`);

    return {
      success: successCount > 0,
      totalSent: successCount,
      totalFailed: recipients.length - successCount,
      results
    };

  } catch (error) {
    console.error('Bulk email sending failed:', error);
    if (useSMTP) {
      smtpTransporterInstance = null;
    }
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  emailTemplates
};
