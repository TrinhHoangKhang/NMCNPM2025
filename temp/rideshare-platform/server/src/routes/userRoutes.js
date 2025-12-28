const express = require('express');
const router = express.Router();
const { getUserById, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUserProfile);

module.exports = router;
