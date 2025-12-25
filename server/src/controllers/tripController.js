import tripService from '../services/tripService.js';

class TripController {
    // 1. POST /api/trips/request
    async requestTrip(req, res) {
        try {
            const {
                pickupLocation, pickup_location,
                dropoffLocation, destination_location,
                vehicleType, paymentMethod, fare_id
            } = req.body;

            const finalPickup = pickupLocation || pickup_location;
            const finalDropoff = dropoffLocation || destination_location;

            // Validate required fields
            if (!finalPickup || !finalDropoff || !vehicleType || !paymentMethod) {
                return res.status(400).json({
                    error: "Missing required fields: pickupLocation, dropoffLocation, vehicleType, paymentMethod"
                });
            }

            // Validate location structure
            if (!finalPickup.lat || !finalPickup.lng || !finalDropoff.lat || !finalDropoff.lng) {
                return res.status(400).json({
                    error: "Location objects must contain lat and lng properties"
                });
            }

            const riderId = req.user.uid; // Identified via JWT token

            const newTrip = await tripService.createTripRequest(
                riderId,
                finalPickup,
                finalDropoff,
                vehicleType,
                paymentMethod,
                fare_id
            );

            // Return the trip ID so the client can reference/cancel later
            res.status(201).json({ id: newTrip.id, ...newTrip.toJSON() });
        } catch (error) {
            console.error("Trip request error:", error);
            res.status(400).json({ error: error.message });
        }
    }

    // 1b. POST /api/trips/estimate (Before the user confirm the ride)
    async getTripEstimate(req, res) {
        try {
            const { pickupLocation, pickup_location, dropoffLocation, destination_location, vehicleType } = req.body;

            const finalPickup = pickupLocation || pickup_location;
            const finalDropoff = dropoffLocation || destination_location;

            if (!finalPickup || !finalDropoff) {
                return res.status(400).json({ error: "Missing pickup or destination location" });
            }

            const estimate = await tripService.estimateTrip(
                finalPickup,
                finalDropoff,
                vehicleType
            );
            res.status(200).json(estimate);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 1c. GET /api/trips/current - Get current (active) trip for the authenticated user
    async getCurrentTrip(req, res) {
        try {
            const userId = req.user.uid;
            const currentTrip = await tripService.getCurrentTripForUser(userId);
            if (!currentTrip) {
                return res.status(404).json({ error: 'No current trip' });
            }
            res.status(200).json(currentTrip);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 2. GET /api/trips/history
    async getTripHistory(req, res) {
        try {
            const userId = req.user.uid;
            const history = await tripService.getUserTripHistory(userId);
            // Ensure trip IDs are included in the response
            const withIds = history.map(trip => ({ id: trip.id, ...trip.toJSON() }));
            res.status(200).json(withIds);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 2c. GET /api/trips/driver/history
    async getDriverTripHistory(req, res) {
        try {
            const driverId = req.user.uid;
            const history = await tripService.getDriverTripHistory(driverId);
            const withIds = history.map(trip => ({ id: trip.id, ...trip.toJSON() }));
            res.status(200).json(withIds);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 3. PATCH /api/trips/cancel
    async cancelTrip(req, res) {
        try {
            const userId = req.user.uid;
            // Always cancel the user's current active trip; no tripId lookup from client
            const currentTrip = await tripService.getCurrentTripForUser(userId);
            if (!currentTrip) {
                return res.status(404).json({ error: 'No active trip to cancel' });
            }

            const result = await tripService.cancelTrip(currentTrip.id, userId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 4. GET /api/trips/:id (For specific trip details)
    async getTripDetails(req, res) {
        console.log("GET TRIP DETAILS CALLED");
        try {
            const { id } = req.params;
            const trip = await tripService.getTrip(id);
            res.status(200).json(trip);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    // ===== DRIVER SIDE =====
    // GET /api/trips/available - list of available trip requests
    async getAvailableTrips(req, res) {
        try {
            const trips = await tripService.getAvailableTrips();
            const withIds = trips.map(trip => ({ id: trip.id, ...trip.toJSON() }));
            res.status(200).json(withIds);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // PATCH /api/trips/:id/accept - driver accepts a ride
    async acceptTrip(req, res) {
        try {
            const driverId = req.user.uid;
            const { id } = req.params;
            const trip = await tripService.acceptTrip(id, driverId);
            res.status(200).json({ id: trip.id, ...trip.toJSON() });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // PATCH /api/trips/:id/pickup - driver marks pickup (start ride)
    async markTripPickup(req, res) {
        try {
            const driverId = req.user.uid;
            const { id } = req.params;
            const trip = await tripService.markTripPickup(id, driverId);
            res.status(200).json({ id: trip.id, ...trip.toJSON() });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // PATCH /api/trips/:id/complete - driver completes the ride
    async markTripComplete(req, res) {
        try {
            const driverId = req.user.uid;
            const { id } = req.params;
            const trip = await tripService.markTripComplete(id, driverId);
            res.status(200).json({ id: trip.id, ...trip.toJSON() });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new TripController();