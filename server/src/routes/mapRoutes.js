import express from 'express';
import * as mapController from '../controllers/mapController.js';

const router = express.Router();

// POST /api/maps/calculate-route
router.post('/calculate-route', mapController.calculateRoute);

export default router;