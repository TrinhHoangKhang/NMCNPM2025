import tripService from '../services/tripService.js';
import userService from '../services/userService.js';
import driverService from '../services/driverService.js';
import presenceService from '../services/presenceService.js';

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
            console.log('CONTROLLER DEBUG: req.user is', req.user);
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

            // CHECK: Prevent new trip if user has active trip
            const existingTrip = await tripService.getCurrentTripForUser(riderId, 'RIDER');
            if (existingTrip) {
                return res.status(400).json({ error: "You already have an ongoing trip." });
            }

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

                            // Update status to NO_DRIVER_FOUND
                            await tripService.updateStatus(newTrip.id, 'NO_DRIVER_FOUND');

                            // Notify Rider
                            const riderSocketIds = await presenceService.getUserSocketIds(riderId);
                            if (riderSocketIds.length > 0) {
                                riderSocketIds.forEach(socketId => {
                                    io.to(socketId).emit('trip_no_driver', {
                                        tripId: newTrip.id,
                                        message: "Sorry, no drivers are currently available."
                                    });
                                });
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

    // 1b. POST /api/trips/estimate
    async getTripEstimate(req, res) {
        try {
            const { pickupLocation, dropoffLocation, vehicleType, distance } = req.body;
            const estimate = await tripService.estimateTrip(
                pickupLocation,
                dropoffLocation,
                vehicleType,
                distance
            );
            res.status(200).json(estimate);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 1c. GET /api/trips/current
    async getCurrentTrip(req, res) {
        try {
            const userId = req.user.uid;
            const role = req.user.role;
            const currentTrip = await tripService.getCurrentTripForUser(userId, role);
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
            let { tripId } = req.body || {};

            if (!tripId) {
                const currentTrip = await tripService.getCurrentTripForUser(userId);
                if (currentTrip) {
                    tripId = currentTrip.id;
                }
            }

            if (!tripId) {
                return res.status(404).json({ error: 'No active trip to cancel' });
            }

            const result = await tripService.cancelTrip(tripId, userId);

            // SOCKET NOTIFICATION
            if (result.status === 'CANCELLED') {
                const io = req.app.get('socketio');
                if (io) {
                    // Determine recipient: If cancelled by Rider, notify Driver. If by Driver, notify Rider.
                    // We need to know who the other party is.
                    // result usually contains trip info. Let's assume result is the cancelled trip object.
                    // If userId is Rider, target Driver.

                    let targetUserId = null;
                    if (userId === result.riderId) { // Cancelled by Rider
                        targetUserId = result.driverId;
                    } else if (userId === result.driverId) { // Cancelled by Driver
                        targetUserId = result.riderId;
                    }

                    if (targetUserId) {
                        const socketIds = await presenceService.getUserSocketIds(targetUserId);
                        socketIds.forEach(socketId => {
                            io.to(socketId).emit('trip_cancelled', {
                                tripId: tripId,
                                cancelledBy: userId,
                                reason: "Trip Cancelled"
                            });
                        });
                        console.log(`Socket emitted trip_cancelled to ${targetUserId}`);
                    }
                }
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 4. GET /api/trips/:id
    async getTripDetails(req, res) {
        try {
            const { id } = req.params;
            const trip = await tripService.getTrip(id);
            res.status(200).json(trip);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    // ===== DRIVER SIDE =====
    // GET /api/trips/available
    async getAvailableTrips(req, res) {
        try {
            const driverId = req.user.uid;
            const driverProfile = await userService.getUser(driverId);
            const activeVehicle = driverProfile.vehicle;

            if (!activeVehicle || !activeVehicle.type) {
                return res.status(200).json([]);
            }

            const vehicleType = activeVehicle.type;
            const trips = await tripService.getAvailableTrips(vehicleType);
            const withIds = trips.map(trip => ({ id: trip.id, ...trip.toJSON() }));

            res.status(200).json(withIds);
        } catch (error) {
            console.error("Get Available Trips Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // PATCH /api/trips/:id/accept
    async acceptTrip(req, res) {
        try {
            const driverId = req.user.uid;
            const { id } = req.params;

            const driverProfile = await driverService.getDriver(driverId);
            console.log("DEBUG: Driver Profile:", JSON.stringify(driverProfile, null, 2));
            const activeVehicle = driverProfile.vehicle;

            if (!activeVehicle || !activeVehicle.type) {
                return res.status(400).json({ error: "No active vehicle found. Please update your vehicle profile." });
            }

            const trip = await tripService.acceptTrip(id, driverId, activeVehicle.type);

            // STEP 3: Socket Logic - Join Room & Notify Rider
            const io = req.app.get('socketio');
            if (io) {
                const roomName = `trip_${trip.id}`;

                // 1. Get Sockets
                const riderSocketIds = await presenceService.getUserSocketIds(trip.riderId);
                const driverSocketIds = await presenceService.getUserSocketIds(driverId);

                // 2. Make Driver Join Room
                driverSocketIds.forEach(socketId => {
                    const socket = io.sockets.sockets.get(socketId);
                    if (socket) socket.join(roomName);
                });

                // 3. Make Rider Join Room and Notify
                riderSocketIds.forEach(socketId => {
                    const socket = io.sockets.sockets.get(socketId);
                    if (socket) {
                        socket.join(roomName);
                        io.to(socketId).emit('trip_accepted', {
                            tripId: trip.id,
                            driverId: driverId,
                            driverName: req.user.name || "Driver",
                            status: 'ACCEPTED'
                        });
                    }
                });

                console.log(`Sockets joined room ${roomName}`);
            }

            res.status(200).json({ id: trip.id, ...trip.toJSON() });
        } catch (error) {
            console.error("Accept trip error:", error);
            res.status(400).json({ error: error.message });
        }
    }

    // PATCH /api/trips/:id/pickup
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

    // PATCH /api/trips/:id/complete
    async markTripComplete(req, res) {
        try {
            const driverId = req.user.uid;
            const { id } = req.params;
            const { cashCollected } = req.body;
            let paymentStatus = null;
            if (cashCollected === true) {
                paymentStatus = 'PAID';
            }

            const trip = await tripService.markTripComplete(id, driverId, paymentStatus);

            // Socket: Notify Completion & Cleanup
            const io = req.app.get('socketio');
            if (io) {
                // Notify Rider and Driver Specifically
                const riderSocketIds = await presenceService.getUserSocketIds(trip.riderId);
                const driverSocketIds = await presenceService.getUserSocketIds(driverId);

                const allSockets = [...riderSocketIds, ...driverSocketIds];

                allSockets.forEach(socketId => {
                    io.to(socketId).emit('trip_completed', {
                        tripId: trip.id,
                        fare: trip.fare,
                        status: 'COMPLETED'
                    });
                });

                // Cleanup room (Optional now, as we don't rely on it, but good practice)
                const roomName = `trip_${trip.id}`;
                io.in(roomName).socketsLeave(roomName);
                console.log(`Trip ${trip.id} completed. Notifications sent via Redis.`);
            }

            res.status(200).json({ id: trip.id, ...trip.toJSON() });
        } catch (error) {
            console.error("Complete trip error:", error);
            res.status(400).json({ error: error.message });
        }
    }
}

export default new TripController();