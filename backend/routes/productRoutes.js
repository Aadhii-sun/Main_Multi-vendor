const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { validateProduct } = require('../middleware/validationMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);

router.use(authMiddleware);

router.post('/', authorizeRoles('seller'), validateProduct, createProduct);
router.put('/:id', authorizeRoles('seller','admin'), validateProduct, updateProduct);
router.delete('/:id', authorizeRoles('seller','admin'), deleteProduct);

module.exports = router;
