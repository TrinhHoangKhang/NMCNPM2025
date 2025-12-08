const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// POST /api/maps/calculate-route
router.post('/calculate-route', mapController.calculateRoute);

module.exports = router;