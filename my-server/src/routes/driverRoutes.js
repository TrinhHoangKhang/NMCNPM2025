import express from 'express';
const router = express.Router();
import * as driverController from '../controllers/driverController.js';
import driverStatsController from '../controllers/driverStatsController.js';

import checkAuth from '../middleware/checkAuth.js';

// Apply authentication middleware to all driver routes
router.use(checkAuth);

/**
 * @swagger
 * tags:
 *   name: Drivers
 *   description: Driver management endpoints
 */

/**
 * @swagger
 * /drivers/stats:
 *   get:
 *     summary: Get driver statistics
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver statistics
 * 
 * /drivers/status:
 *   patch:
 *     summary: Update driver status
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE]
 *     responses:
 *       200:
 *         description: Status updated
 * 
 * /drivers/{id}:
 *   get:
 *     summary: Get driver profile
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Driver profile
 *   patch:
 *     summary: Update driver profile
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated
 * 
 * /drivers/{id}/status:
 *   patch:
 *     summary: Update driver status (Admin/Specific)
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 * 
 * /drivers/{id}/location:
 *   patch:
 *     summary: Update driver location
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated
 */
// GET /api/drivers/stats - Get Driver Statistics (Ranking, Earnings, etc.)
router.get('/stats', driverStatsController.getDriverStats);

// GET /api/drivers/:id - Get Driver Profile
router.get('/:id', driverController.getDriver);

// PATCH /api/drivers/status - Update Driver Status (Using Auth Token ID)
router.patch('/status', driverController.updateStatus);

// PATCH /api/drivers/:id - Update Driver Profile (Vehicle, License, etc.)
router.patch('/:id', driverController.updateDriver);

// PATCH /api/drivers/:id/status - Update Driver Status (Admin/Specific)
router.patch('/:id/status', driverController.updateStatus);

// PATCH /api/drivers/:id/location - Update Driver Location (Lat/Lng)
router.patch('/:id/location', driverController.updateLocation);

export default router;
