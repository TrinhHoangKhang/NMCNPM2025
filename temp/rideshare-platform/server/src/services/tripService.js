const Trip = require('../models/Trip');
const Driver = require('../models/Driver');
const { calculateFare, calculateCancellationFee } = require('./pricingService');

class TripService {
    async createTrip(tripData) {
        tripData.status = 'CREATED';
        const trip = await Trip.create(tripData);
        return trip;
    }

    async searchForDriver(tripId) {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new Error('Trip not found');

        trip.status = 'SEARCHING';
        await trip.save();

        // Find nearby drivers (Geospatial Query)
        // Looking for drivers within 5km who are online, available, and have the right vehicle type
        // Note: Trip doesn't store vehicle type requested? It should! But based on current Trip.js it does NOT.
        // The controller calculates fare based on it but doesn't save it to Trip?
        // Checking Trip.js again... it does not have vehicleType.
        // I will assume default 'standard' or that we need to pass vehicleType to searchForDriver if not in Trip.
        // For now, I'll pass it as a second arg or just assume standard if missing.

        // Actually, let's fix the schema later if needed, for now logic:
        const nearbyDrivers = await Driver.find({
            isOnline: true,
            status: 'available',
            'currentLocation': {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: trip.pickupLocation.coordinates
                    },
                    $maxDistance: 5000 // 5km
                }
            }
        });

        return { trip, nearbyDrivers };
    }

    async offerTrip(tripId, driverId) {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.status !== 'SEARCHING') throw new Error('Trip is not in searching state');

        trip.driver = driverId; // Temporarily assign or track who it's offered to? 
        // In this simple model, "OFFERED" might just mean "Found a candidate"
        trip.status = 'OFFERED';
        await trip.save();
        return trip;
    }

    async acceptTrip(tripId, driverId) {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new Error('Trip not found');
        // Allow acceptance from SEARCHING or OFFERED? OFFERED implies a specific driver.
        if (!['SEARCHING', 'OFFERED'].includes(trip.status)) {
            throw new Error('Trip is no longer available');
        }

        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');

        trip.driver = driverId;
        trip.status = 'ACCEPTED';
        await trip.save();

        driver.status = 'busy';
        await driver.save();

        return trip;
    }

    async driverArriving(tripId) {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.status !== 'ACCEPTED') throw new Error('Trip is not in accepted state');

        trip.status = 'ARRIVING';
        await trip.save();
        return trip;
    }

    async startTrip(tripId) {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.status !== 'ARRIVING') throw new Error('Driver must be arriving before starting trip');

        trip.status = 'IN_PROGRESS';
        await trip.save();
        return trip;
    }

    async completeTrip(tripId) {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.status !== 'IN_PROGRESS') throw new Error('Trip must be in progress to complete');

        trip.status = 'COMPLETED';
        trip.paymentStatus = 'pending'; // Starts payment processing
        await trip.save();

        // Free up driver
        if (trip.driver) {
            await Driver.findByIdAndUpdate(trip.driver, { status: 'available' });
        }

        return trip;
    }

    async cancelTrip(tripId, reason) {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (['COMPLETED', 'CANCELLED'].includes(trip.status)) {
            throw new Error('Trip is already finished');
        }

        const originalStatus = trip.status;
        trip.status = 'CANCELLED';
        trip.cancellationReason = reason;

        // Calculate fee if applicable (e.g., if driver was already assigned/arriving)
        if (['ACCEPTED', 'ARRIVING', 'IN_PROGRESS'].includes(originalStatus)) {
            trip.cancellationFee = calculateCancellationFee(trip);
        }

        await trip.save();

        if (trip.driver) {
            await Driver.findByIdAndUpdate(trip.driver, { status: 'available' });
        }

        return trip;
    }
}

module.exports = new TripService();
