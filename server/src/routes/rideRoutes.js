import express from 'express';
import tripController from '../controllers/tripController.js';
import checkAuth from '../middleware/checkAuth.js';
import checkDriver from '../middleware/checkDriver.js';

const router = express.Router();

router.use(checkAuth);

// POST /api/rides/request
router.post('/request', tripController.requestTrip);

// PUT /api/rides/:id/accept
router.put('/:id/accept', checkDriver, tripController.acceptTrip);

export default router;
