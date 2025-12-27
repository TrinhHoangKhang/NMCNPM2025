import express from 'express';
import tripController from './rideController.js';
import checkAuth from '../../api/middlewares/checkAuth.js';
import checkDriver from '../../api/middlewares/checkDriver.js';

const router = express.Router();

router.use(checkAuth);

// POST /api/rides/request
router.post('/request', tripController.requestTrip);

// GET /api/rides/current
router.get('/current', tripController.getCurrentTrip);

// GET /api/rides/history
router.get('/history', tripController.getTripHistory);

// PATCH /api/rides/cancel
router.patch('/cancel', tripController.cancelTrip);

// GET /api/rides/available
router.get('/available', checkDriver, tripController.getAvailableTrips);

// GET /api/rides/driver/history
router.get('/driver/history', checkDriver, tripController.getDriverTripHistory);

// GET /api/rides/:id
router.get('/:id', tripController.getTripDetails);

// PUT /api/rides/:id/accept
router.put('/:id/accept', checkDriver, tripController.acceptTrip);

// PATCH /api/rides/:id/pickup
router.patch('/:id/pickup', checkDriver, tripController.markTripPickup);

// PATCH /api/rides/:id/complete
router.patch('/:id/complete', checkDriver, tripController.markTripComplete);

export default router;
