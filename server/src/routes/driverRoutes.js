import express from 'express';
import * as driverController from '../controllers/driverController.js';

const router = express.Router();

// POST /api/drivers - Create/Register Driver Profile
router.post('/', driverController.createDriver);

// GET /api/drivers/nearby - Get nearby drivers for mapping
router.get('/nearby', driverController.getNearbyDrivers);

// GET /api/drivers/profile - Get current driver's profile
router.get('/profile', driverController.getDriver);

// GET /api/drivers/:id - Get Driver Profile
router.get('/:id', driverController.getDriver);

// PATCH /api/drivers/:id - Update Driver Profile (Vehicle, License, etc.)
router.patch('/:id', driverController.updateDriver);

// PATCH /api/drivers/status - Update current driver's status
router.patch('/status', driverController.updateStatus);

// PATCH /api/drivers/:id/status - Update Driver Status (ONLINE/OFFLINE)
router.patch('/:id/status', driverController.updateStatus);

// PATCH /api/drivers/location - Update current driver's location
router.patch('/location', driverController.updateLocation);

// PATCH /api/drivers/:id/location - Update Driver Location (Lat/Lng)
router.patch('/:id/location', driverController.updateLocation);

export default router;
