const tripService = require('../services/tripService');

exports.requestTrip = async (req, res) => {
    try {
        const { riderId, pickup, dropoff } = req.body;

        // Basic validation
        if (!riderId || !pickup || !dropoff) {
            return res.status(400).json({ error: "Missing required fields (riderId, pickup, dropoff)" });
        }

        const trip = await tripService.createTripRequest(riderId, pickup, dropoff);
        res.status(201).json({ success: true, data: trip });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.acceptTrip = async (req, res) => {
    try {
        const { driverId } = req.body;
        const { id } = req.params;

        const result = await tripService.acceptTrip(id, driverId);
        res.status(200).json({ success: true, data: result });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const result = await tripService.updateStatus(id, status);
        res.status(200).json({ success: true, data: result });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getTrip = async (req, res) => {
    try {
        const trip = await tripService.getTrip(req.params.id);
        res.status(200).json({ success: true, data: trip });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
};
