import express from 'express';
const router = express.Router();
import * as mapController from '../controllers/mapController.js';

// POST /api/maps/calculate-route
router.post('/calculate-route', mapController.calculateRoute);

export default router;