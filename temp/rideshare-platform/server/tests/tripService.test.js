const mongoose = require('mongoose');
const dotenv = require('dotenv');
const tripService = require('../src/services/tripService');
const Trip = require('../src/models/Trip');
const Driver = require('../src/models/Driver');
const User = require('../src/models/User');

// Load env vars
dotenv.config();

describe('Trip Service Integration', () => {
    let riderId, driverId, tripId;

    beforeAll(async () => {
        // Connect to DB
        // Use a test connection string if available, otherwise default (be careful)
        // In this environment, we likely want to use the same logic as app.js or similar
        // We'll trust process.env.MONGO_URI is set by dotenv
        await mongoose.connect(process.env.MONGO_URI);

        // Cleanup
        await Trip.deleteMany({});
        await Driver.deleteMany({});
        await User.deleteMany({});

        // Create Rider
        const rider = await User.create({
            username: 'ServiceRider',
            email: 'servicerider@test.com',
            password: 'password123',
            role: 'rider',
            phone: '1111111111'
        });
        riderId = rider._id;

        // Create Driver
        const driverUser = await User.create({
            username: 'ServiceDriver',
            email: 'servicedriver@test.com',
            password: 'password123',
            role: 'driver',
            phone: '2222222222'
        });

        const driver = await Driver.create({
            user: driverUser._id,
            vehicle: { model: 'TestCar', plate: 'TEST-123', type: 'standard' },
            currentLocation: { type: 'Point', coordinates: [0, 0] },
            isOnline: true,
            status: 'available'
        });
        driverId = driver._id;
    });

    afterAll(async () => {
        // Cleanup
        await Trip.deleteMany({});
        await Driver.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    it('should create a trip', async () => {
        const tripData = {
            rider: riderId,
            pickupLocation: { address: 'Start', coordinates: [0, 0] },
            dropoffLocation: { address: 'End', coordinates: [0, 0.01] },
            fare: 10,
            distance: 1000, // 1km
            duration: 300 // 5m
        };

        const trip = await tripService.createTrip(tripData);
        expect(trip).toBeDefined();
        expect(trip.status).toBe('CREATED');
        tripId = trip._id;
    });

    it('should search for driver', async () => {
        const { trip, nearbyDrivers } = await tripService.searchForDriver(tripId);
        expect(trip.status).toBe('SEARCHING');
        expect(nearbyDrivers).toBeInstanceOf(Array);
        expect(nearbyDrivers.length).toBeGreaterThan(0); // Should find our driver at 0,0
    });

    it('should offer trip (manual step in service usually, but simulated here)', async () => {
        const trip = await tripService.offerTrip(tripId, driverId);
        expect(trip.status).toBe('OFFERED');
        // Check driver wasn't assigned yet in DB? Service says: trip.driver = driverId (temporarily)
        expect(trip.driver.toString()).toBe(driverId.toString());
    });

    it('should accept trip', async () => {
        const trip = await tripService.acceptTrip(tripId, driverId);
        expect(trip.status).toBe('ACCEPTED');

        const driver = await Driver.findById(driverId);
        expect(driver.status).toBe('busy');
    });

    it('should set driver arriving', async () => {
        const trip = await tripService.driverArriving(tripId);
        expect(trip.status).toBe('ARRIVING');
    });

    it('should start trip', async () => {
        const trip = await tripService.startTrip(tripId);
        expect(trip.status).toBe('IN_PROGRESS');
    });

    it('should complete trip', async () => {
        const trip = await tripService.completeTrip(tripId);
        expect(trip.status).toBe('COMPLETED');
        expect(trip.paymentStatus).toBe('pending');

        const driver = await Driver.findById(driverId);
        expect(driver.status).toBe('available');
    });

    it('should calculate cancellation fee for another trip', async () => {
        // Create new trip
        const trip2 = await tripService.createTrip({
            rider: riderId,
            pickupLocation: { address: 'Start', coordinates: [0, 0] },
            dropoffLocation: { address: 'End', coordinates: [0, 0.01] },
            fare: 10,
            distance: 1000,
            duration: 300
        });

        await tripService.searchForDriver(trip2._id);
        await tripService.acceptTrip(trip2._id, driverId); // Driver accepted

        const cancelledTrip = await tripService.cancelTrip(trip2._id, 'Changed mind');
        expect(cancelledTrip.status).toBe('CANCELLED');
        expect(cancelledTrip.cancellationFee).toBe(5.00); // Fixed fee we set

        const driver = await Driver.findById(driverId);
        expect(driver.status).toBe('available');
    });
});
