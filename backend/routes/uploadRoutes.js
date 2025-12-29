const express = require('express');
const router = express.Router();
const {
  uploadImage,
  uploadImageFromUrl,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getOptimizedUrl,
  getTransformedUrl,
  getThumbnailUrl,
  getResponsiveUrl,
  getImageInfo
} = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Upload routes (require auth - sellers and admins)
router.use(authMiddleware);

// Upload endpoints
router.post('/', authorizeRoles('seller', 'admin'), uploadImage);
router.post('/url', authorizeRoles('seller', 'admin'), uploadImageFromUrl);
router.post('/multiple', authorizeRoles('seller', 'admin'), uploadMultipleImages);

// Delete endpoints
router.delete('/', authorizeRoles('seller', 'admin'), deleteImage);
router.delete('/multiple', authorizeRoles('seller', 'admin'), deleteMultipleImages);

// URL generation endpoints (public - no auth required for GET requests)
router.get('/optimized', getOptimizedUrl);
router.get('/transformed', getTransformedUrl);
router.get('/thumbnail', getThumbnailUrl);
router.get('/responsive', getResponsiveUrl);
router.get('/info', getImageInfo);

module.exports = router;











