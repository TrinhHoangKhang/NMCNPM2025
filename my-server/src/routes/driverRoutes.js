import express from 'express';
const router = express.Router();
import * as driverController from '../controllers/driverController.js';

import checkAuth from '../middleware/checkAuth.js';

// Apply authentication middleware to all driver routes
router.use(checkAuth);

// GET /api/drivers/:id - Get Driver Profile
router.get('/:id', driverController.getDriver);


// PATCH /api/drivers/:id - Update Driver Profile (Vehicle, License, etc.)
router.patch('/:id', driverController.updateDriver);

// PATCH /api/drivers/status - Update Driver Status (Using Auth Token ID)
router.patch('/status', driverController.updateStatus);

// PATCH /api/drivers/:id/status - Update Driver Status (Admin/Specific)
router.patch('/:id/status', driverController.updateStatus);

// PATCH /api/drivers/:id/location - Update Driver Location (Lat/Lng)
router.patch('/:id/location', driverController.updateLocation);

export default router;
