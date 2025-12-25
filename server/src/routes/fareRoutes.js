import express from 'express';
import tripController from '../controllers/tripController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.use(checkAuth);

// POST /api/fares/estimate
router.post('/estimate', tripController.getTripEstimate);

export default router;
