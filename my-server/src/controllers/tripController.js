import tripService from '../services/tripService.js';
import userService from '../services/userService.js';


class TripController {
    // 0. ADMIN - Get all trips
    async getAllTrips(req, res) {
        try {
            const trips = await tripService.getAllTrips();
            const withIds = trips.map(trip => ({ id: trip.id, ...trip.toJSON() }));
            res.status(200).json({ success: true, data: withIds });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // 1. POST /api/trips/request
    async requestTrip(req, res) {
        try {
            const { pickupLocation, dropoffLocation, vehicleType, paymentMethod } = req.body;

            // Validate required fields
            if (!pickupLocation || !dropoffLocation || !vehicleType || !paymentMethod) {
                return res.status(400).json({
                    error: "Missing required fields: pickupLocation, dropoffLocation, vehicleType, paymentMethod"
                });
            }

            // Validate location structure
            if (!pickupLocation.lat || !pickupLocation.lng || !dropoffLocation.lat || !dropoffLocation.lng) {
                return res.status(400).json({
                    error: "Location objects must contain lat and lng properties"
                });
            }

            const riderId = req.user.uid; // Identified via JWT token

            const newTrip = await tripService.createTripRequest(
                riderId,
                pickupLocation,
                dropoffLocation,
                vehicleType,
                paymentMethod
            );

            // Return the trip ID so the client can reference/cancel later
            res.status(201).json({ id: newTrip.id, ...newTrip.toJSON() });

            // STEP 1 [NEW]: Broadcast to all online drivers
            const io = req.app.get('socketio');
            if (io) {
                io.to('drivers').emit('new_ride_request', {
                    id: newTrip.id,
                    pickupLocation: newTrip.pickupLocation,
                    dropoffLocation: newTrip.dropoffLocation,
                    fare: newTrip.fare,
                    distance: newTrip.distance,
                    vehicleType: newTrip.vehicleType,
                    riderName: req.user.name || "Rider" // Ensure name is available in token or fetched
                });
                console.log(`Broadcasted trip ${newTrip.id} to drivers`);

                // STEP 2 [NEW]: Start 60s Timeout for Matching
                setTimeout(async () => {
                    try {
                        const currentTrip = await tripService.getTrip(newTrip.id);
                        if (currentTrip && currentTrip.status === 'REQUESTED') {
                            console.log(`Trip ${newTrip.id} timed out. No driver found.`);

                            // Update status to NO_DRIVER_FOUND (or CANCELLED/FAILED)
                            // Reuse cancelTrip logic or updateStatus directly? 
                            // Let's perform a direct update via tripService.updateStatus if transparent, 
                            // or better yet, implement a failTrip method? For now, I'll update manually.
                            // We need to verify if tripService.updateStatus exists or just create one.
                            await tripService.updateStatus(newTrip.id, 'NO_DRIVER_FOUND');

                            // Notify Rider
                            const onlineUsers = req.app.get('onlineUsers');
                            if (onlineUsers) {
                                const riderSocketId = onlineUsers.get(riderId);
                                if (riderSocketId) {
                                    io.to(riderSocketId).emit('trip_no_driver', {
                                        tripId: newTrip.id,
                                        message: "Sorry, no drivers are currently available."
                                    });
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Timeout check failed:", err.message);
                    }
                }, 60000); // 1 minute
            }
        } catch (error) {
            console.error("Trip request error:", error);
            res.status(400).json({ error: error.message });
        }
    }

    // 1b. POST /api/trips/estimate (Before the user confirm the ride)
    async getTripEstimate(req, res) {
        try {
            const { pickupLocation, dropoffLocation, vehicleType } = req.body;
            const estimate = await tripService.estimateTrip(
                pickupLocation,
                dropoffLocation,
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
                return res.status(200).json(null);
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
    // PATCH /api/trips/:id/accept - driver accepts a ride
    async acceptTrip(req, res) {
        try {
            const driverId = req.user.uid;
            const { id } = req.params;
            const trip = await tripService.acceptTrip(id, driverId);

            // STEP 2: Socket Logic - Join Room & Notify Rider
            const io = req.app.get('socketio');
            const onlineUsers = req.app.get('onlineUsers');

            if (io && onlineUsers) {
                const roomName = `trip_${trip.id}`;

                // 1. Get Sockets
                const riderSocketId = onlineUsers.get(trip.riderId);
                const driverSocketId = onlineUsers.get(driverId);

                // 2. Make Driver Join Room
                if (driverSocketId) {
                    const driverSocket = io.sockets.sockets.get(driverSocketId);
                    if (driverSocket) driverSocket.join(roomName);
                }

                // 3. Make Rider Join Room and Notify
                if (riderSocketId) {
                    const riderSocket = io.sockets.sockets.get(riderSocketId);
                    if (riderSocket) {
                        riderSocket.join(roomName);
                        // Notify Rider specifically that trip is accepted
                        io.to(riderSocketId).emit('trip_accepted', {
                            tripId: trip.id,
                            driverId: driverId,
                            driverName: req.user.name || "Driver", // Should fetch full profile usually
                            status: 'ACCEPTED'
                        });
                    }
                }

                console.log(`Sockets joined room ${roomName}`);
            }

            res.status(200).json({ id: trip.id, ...trip.toJSON() });
        } catch (error) {
            console.error("Accept trip error:", error);
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
    // PATCH /api/trips/:id/complete - driver completes the ride
    async markTripComplete(req, res) {
        try {
            const driverId = req.user.uid;
            const { id } = req.params;

            // 1. Mark Complete in DB
            const trip = await tripService.markTripComplete(id, driverId);

            // 2. Handle Payment (Scenario)
            // USER REQUEST: Leave transaction blank first. 
            // The driver confirms payment manually in Frontend.
            // When we reach here, we assume payment is done (Cash or Direct Transfer).

            // Placeholder function for future banking integration:
            const processPayment = (trip) => {
                // TODO: Integrate Banking Provider here
                console.log(`[BLANK] Processing payment for trip ${trip.id}. Payment Method: ${trip.paymentMethod}`);
                return true;
            };

            processPayment(trip);

            // Note: We are NOT deducting from internal wallet anymore per request.
            // await userService.updateWalletBalance(...) <--- REMOVED

            // 3. Socket: Notify Completion & Cleanup
            const io = req.app.get('socketio');
            if (io) {
                const roomName = `trip_${trip.id}`;

                // Notify Everyone
                io.to(roomName).emit('trip_completed', {
                    tripId: trip.id,
                    fare: trip.fare,
                    status: 'COMPLETED'
                });

                // Force leave room (cleanup)
                io.in(roomName).socketsJoin('completed_trips_archive'); // Move them out implies leaving logic or just clear
                io.in(roomName).socketsLeave(roomName);

                console.log(`Trip ${trip.id} completed. Room closed.`);
            }

            res.status(200).json({ id: trip.id, ...trip.toJSON() });
        } catch (error) {
            console.error("Complete trip error:", error);
            res.status(400).json({ error: error.message });
        }
    }
}

export default new TripController();