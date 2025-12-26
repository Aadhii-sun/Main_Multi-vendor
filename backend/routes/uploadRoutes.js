const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Require auth for uploads; sellers and admins can upload/delete
router.use(authMiddleware);
router.post('/', authorizeRoles('seller', 'admin'), uploadImage);
router.delete('/', authorizeRoles('seller', 'admin'), deleteImage);

module.exports = router;









