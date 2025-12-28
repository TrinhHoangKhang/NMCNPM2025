const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users/:id - Get User Profile
router.get('/:id', userController.getUser);

// PATCH /api/users/:id - Update User Profile
router.patch('/:id', userController.updateUser);

module.exports = router;
