const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, getUsersByRole, toggleUserStatus } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', authorizeRoles('admin'), getUsers);
router.get('/role/:role', authorizeRoles('admin'), getUsersByRole);
router.get('/:id', authorizeRoles('admin','seller','user'), getUserById);
router.put('/:id', authorizeRoles('admin','seller','user'), updateUser);
router.put('/:id/toggle-status', authorizeRoles('admin'), toggleUserStatus);

module.exports = router;
