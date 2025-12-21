const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// POST /api/trips/request - Request a new ride
router.post('/request', tripController.requestTrip);

// GET /api/trips/:id - Get trip details
router.get('/:id', tripController.getTrip);

// PATCH /api/trips/:id/accept - Driver accepts a ride
router.patch('/:id/accept', tripController.acceptTrip);

// PATCH /api/trips/:id/status - Update status (IN_PROGRESS, COMPLETED)
router.patch('/:id/status', tripController.updateStatus);

module.exports = router;
