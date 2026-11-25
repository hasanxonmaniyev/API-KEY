const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users - Create a new user API
router.post('/', userController.createUser);

// GET /api/users - Get all created users
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Get one user by ID
router.get('/:id', userController.getUserById);

// PUT /api/users/:id - Update user data
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user data
router.delete('/:id', userController.deleteUser);

module.exports = router;
