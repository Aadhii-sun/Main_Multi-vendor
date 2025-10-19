const express = require('express');
const router = express.Router();
const { getSellers, getSellerById, approveSeller } = require('../controllers/sellerController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, authorizeRoles('admin'), getSellers);
router.get('/:id', authMiddleware, authorizeRoles('admin', 'seller'), getSellerById);
router.put('/:id/approve', authMiddleware, authorizeRoles('admin'), approveSeller);

module.exports = router;
