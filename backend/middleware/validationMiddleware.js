const { body, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['user', 'seller', 'admin'])
    .withMessage('Role must be user, seller, or admin'),
  handleValidationErrors
];

const validateUserSignin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Product validation rules
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('countInStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock count must be a non-negative integer'),
  handleValidationErrors
];

// Order validation rules
const validateOrder = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('orderItems.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('orderItems.*.qty')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('orderItems.*.price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('totalPrice')
    .isFloat({ min: 0.01 })
    .withMessage('Total price must be a positive number'),
  handleValidationErrors
];

module.exports = {
  validateUserSignup,
  validateUserSignin,
  validateProduct,
  validateOrder,
  handleValidationErrors
};

