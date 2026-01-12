import express from 'express';
const router = express.Router();
import * as mapController from '../controllers/mapController.js';

/**
 * @swagger
 * tags:
 *   name: Maps
 *   description: Map utility endpoints
 */

/**
 * @swagger
 * /maps/calculate-route:
 *   post:
 *     summary: Calculate route between two points
 *     tags: [Maps]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *     responses:
 *       200:
 *         description: Route calculated
 */
// POST /api/maps/calculate-route
router.post('/calculate-route', mapController.calculateRoute);

export default router;