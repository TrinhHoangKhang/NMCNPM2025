const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { requestRide, acceptRide, getRideDetails, getRideHistory, getAvailableRides, cancelRide, driverArriving, startTrip, completeTrip } = require('../controllers/rideController');
const { updateDriverProfile, updateLocation, toggleStatus } = require('../controllers/driverController');

// Ride Routes
router.post('/request', protect, requestRide);
router.get('/history', protect, getRideHistory); // Order matters: specific paths before params
router.post('/:id/accept', protect, acceptRide);
router.post('/:id/cancel', protect, cancelRide);
router.get('/available', protect, getAvailableRides);
router.get('/:id', protect, getRideDetails);
router.post('/:id/arrived', protect, driverArriving);
router.post('/:id/start', protect, startTrip);
router.post('/:id/complete', protect, completeTrip);

// Driver Routes - Could be separate file but keeping here for simplicity or creating driverRoutes.js
// Let's assume we use /api/drivers for driver stuff.
// So I will make a separate driverRoutes file.
module.exports = router;
