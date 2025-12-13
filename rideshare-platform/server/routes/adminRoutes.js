const express = require('express');
const router = express.Router();
const { getSystemStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route: /api/admin/stats
router.get('/stats', protect, admin, getSystemStats);

module.exports = router;
