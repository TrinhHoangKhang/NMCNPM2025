const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { requestRide, acceptRide, getRideDetails, getRideHistory } = require('../controllers/rideController');
const { updateDriverProfile, updateLocation, toggleStatus } = require('../controllers/driverController');

// Ride Routes
router.post('/request', protect, requestRide);
router.get('/history', protect, getRideHistory); // Order matters: specific paths before params
router.post('/:id/accept', protect, acceptRide);
router.get('/:id', protect, getRideDetails);

// Driver Routes - Could be separate file but keeping here for simplicity or creating driverRoutes.js
// Let's assume we use /api/drivers for driver stuff.
// So I will make a separate driverRoutes file.
module.exports = router;
