const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

const checkAuth = require('../middleware/checkAuth');

// Apply authentication middleware to all driver routes
router.use(checkAuth);

// GET /api/drivers/:id - Get Driver Profile
router.get('/:id', driverController.getDriver);


// PATCH /api/drivers/:id - Update Driver Profile (Vehicle, License, etc.)
router.patch('/:id', driverController.updateDriver);

// PATCH /api/drivers/:id/status - Update Driver Status (ONLINE/OFFLINE)
router.patch('/:id/status', driverController.updateStatus);

// PATCH /api/drivers/:id/location - Update Driver Location (Lat/Lng)
router.patch('/:id/location', driverController.updateLocation);

module.exports = router;
