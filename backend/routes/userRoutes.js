const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', authorizeRoles('admin'), getUsers);
router.get('/:id', authorizeRoles('admin','seller','user'), getUserById);
router.put('/:id', authorizeRoles('admin','seller','user'), updateUser);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

module.exports = router;
