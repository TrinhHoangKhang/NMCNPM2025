import express from 'express';
import tripController from '../rides/rideController.js';
import checkAuth from '../../api/middlewares/checkAuth.js';

const router = express.Router();

router.use(checkAuth);

// POST /api/fares/estimate
router.post('/estimate', tripController.getTripEstimate);

export default router;
