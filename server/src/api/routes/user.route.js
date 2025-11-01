const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// Public route - no middleware needed
router.post('/register', userController.registerNewUser);

// Protected route - 'authMiddleware.checkAuth' will run FIRST.
// If it calls next(), THEN 'userController.getUserProfile' will run.
router.get('/me', authMiddleware.checkAuth, userController.getUserProfile);

// Route with a URL parameter
router.get('/:id', userController.getUserById);

module.exports = router;