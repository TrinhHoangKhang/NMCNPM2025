const Trip = require('../models/Trip');
const Driver = require('../models/Driver');
const { calculateFare } = require('../services/pricingService');

// @desc    Request a ride
// @route   POST /api/rides/request
// @access  Private (Rider)
const requestRide = async (req, res) => {
    const { pickupLocation, dropoffLocation, vehicleType, distance, duration } = req.body;

    if (!pickupLocation || !dropoffLocation) {
        return res.status(400).json({ message: 'Pickup and Dropoff locations are required' });
    }

    try {
        console.log("Request Ride Body:", req.body);
        console.log("Request User:", req.user);

        const dist = parseFloat(distance) || 0;
        const dur = parseFloat(duration) || 0;

        if (dist < 0 || dur < 0) {
            return res.status(400).json({ message: "Invalid distance or duration" });
        }

        const fare = calculateFare(dist, dur, vehicleType);
        console.log("Calculated Fare:", fare);

        if (isNaN(fare)) {
            return res.status(400).json({ message: "Fare calculation failed. Invalid inputs." });
        }

        const tripData = {
            rider: req.user._id,
            pickupLocation,
            dropoffLocation,
            fare,
            distance,
            duration,
            status: 'requested'
        };
        console.log("Trip Data to Create:", tripData);

        const trip = await Trip.create(tripData);
        console.log("Trip Created:", trip._id);

        // Find nearby drivers (Geospatial Query)
        // Looking for drivers within 5km who are online, available, and have the right vehicle type
        let nearbyDrivers = [];
        try {
            nearbyDrivers = await Driver.find({
                isOnline: true,
                status: 'available',
                'vehicle.type': vehicleType || 'standard',
                currentLocation: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: pickupLocation.coordinates
                        },
                        $maxDistance: 5000 // 5km
                    }
                }
            });
            console.log(`Found ${nearbyDrivers.length} nearby drivers.`);
        } catch (err) {
            console.error("Geospatial query failed (ensure 2dsphere index exists):", err.message);
            // Fallback: Find any online driver (for demo resiliency)
            nearbyDrivers = await Driver.find({ isOnline: true, status: 'available' }).limit(5);
        }

        if (nearbyDrivers.length === 0) {
            console.log("No drivers found nearby.");
        }

        res.status(201).json(trip);


    } catch (error) {
        console.error("requestRide Error:", error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

// @desc    Accept a ride
// @route   POST /api/rides/:id/accept
// @access  Private (Driver)
const acceptRide = async (req, res) => {
    const { id } = req.params;

    try {
        const trip = await Trip.findById(id);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.status !== 'requested') {
            return res.status(400).json({ message: 'Trip is no longer available' });
        }

        // Check if driver is valid
        const driver = await Driver.findOne({ user: req.user._id });
        if (!driver) {
            return res.status(403).json({ message: 'User is not a driver' });
        }

        trip.driver = driver._id;
        trip.status = 'accepted';
        await trip.save();

        driver.status = 'busy';
        await driver.save();

        // Notify Rider
        req.io.to(`trip_${trip._id}`).emit('ride_accepted', {
            tripId: trip._id,
            driver: {
                name: req.user.realName || req.user.username,
                vehicle: driver.vehicle,
                location: driver.currentLocation
            }
        });

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trip details
// @route   GET /api/rides/:id
// @access  Private
const getRideDetails = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('rider', 'realName username rating phone')
            .populate('driver', 'realName username phone rating vehicle');

        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get trip history
// @route   GET /api/rides/history
// @access  Private
const getRideHistory = async (req, res) => {
    try {
        let query = {};

        // If admin, fetch all. If not, filter by role.
        if (req.user.role === 'admin') {
            query = {}; // All rides
        } else if (req.user.role === 'driver') {
            query = { driver: req.user._id };
        } else {
            // Assume rider
            query = { rider: req.user._id };
        }

        const rides = await Trip.find(query)
            .populate('rider', 'username realName email')
            .populate('driver', 'vehicle username realName')
            .sort({ createdAt: -1 }); // Newest first

        res.json(rides);
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available rides for polling
// @route   GET /api/rides/available
// @access  Private (Driver)
const getAvailableRides = async (req, res) => {
    try {
        const driver = await Driver.findOne({ user: req.user._id });

        if (!driver) {
            return res.status(403).json({ message: 'User is not a driver' });
        }

        // Check if driver is online and available
        // If driver matches criteria for a ride even if offline?, no logic says they must be online to SEE them, but probably yes.
        // For polling, we just return requested rides nearby.

        // Use Driver's last known location.
        // If they haven't updated location recently, this might be stale, but good enough for polling.
        const longitude = driver.currentLocation?.coordinates[0];
        const latitude = driver.currentLocation?.coordinates[1];

        if (!longitude || !latitude) {
            return res.status(400).json({ message: 'Driver location unknown' });
        }

        const rides = await Trip.find({
            status: 'requested',
            'pickupLocation.coordinates': {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 5000 // 5km radius
                }
            }
        }).limit(10); // Limit to 10 for safety

        res.json(rides);
    } catch (error) {
        console.error("Get Available Rides Error:", error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = { requestRide, acceptRide, getRideDetails, getRideHistory, getAvailableRides };
