const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { updateDriverProfile, updateLocation, toggleStatus, getDriverProfile, getNearbyDrivers } = require('../controllers/driverController');

router.get('/nearby', protect, getNearbyDrivers);
router.get('/profile', protect, getDriverProfile);
router.post('/', protect, updateDriverProfile);
router.patch('/location', protect, updateLocation);
router.patch('/status', protect, toggleStatus);

module.exports = router;
