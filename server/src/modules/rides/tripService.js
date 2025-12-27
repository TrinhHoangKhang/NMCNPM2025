import Trip from './tripModel.js';
import rideRepository from './rideRepository.js';
import userService from '../users/userService.js';
import mapsService from '../maps/mapsService.js';
import locationService from '../../shared/services/locationService.js';

// Pricing Config
const PRICING = {
    'MOTORBIKE': { BASE: 1.00, PER_KM: 0.50 },
    '4 SEAT': { BASE: 2.00, PER_KM: 1.00 },
    '7 SEAT': { BASE: 5.00, PER_KM: 2.00 }
};

class TripService {

    /**
     * Finds nearby drivers and sorts them by ETA using Google Maps Distance Matrix
     */
    async getNearbyDriversWithETA(pickupLocation, radiusKm = 5, limit = 10) {
        const candidates = await locationService.findNearbyDrivers(
            pickupLocation.lat,
            pickupLocation.lng,
            radiusKm,
            limit
        );

        if (candidates.length === 0) return [];

        const origins = candidates.map(d => d.currentLocation);
        const destinations = [pickupLocation];

        const matrix = await mapsService.getDistanceMatrix(origins, destinations);

        if (!matrix) return candidates;

        const enriched = candidates.map((driver, index) => {
            const result = matrix.rows[index]?.elements[0];
            if (result && result.status === 'OK') {
                return {
                    ...driver,
                    eta: {
                        text: result.duration.text,
                        value: result.duration.value
                    },
                    travelDistance: {
                        text: result.distance.text,
                        value: result.distance.value
                    }
                };
            }
            return driver;
        });

        return enriched.sort((a, b) => {
            const etaA = a.eta?.value || Infinity;
            const etaB = b.eta?.value || Infinity;
            return etaA - etaB;
        });
    }

    // 1. Create a Trip Request
    async createTripRequest(riderId, pickup, dropoff, vehicleType, paymentMethod, fare_id) {
        const user = await userService.getUser(riderId);
        if (!user || user.role !== 'RIDER') {
            throw new Error("Only users with role RIDER can request a trip");
        }

        const existingTrip = await rideRepository.findActiveTripForUser(riderId);
        if (existingTrip) {
            throw new Error("Cant create new trip: existing active trip found");
        }

        const routeData = await mapsService.calculateRoute(pickup, dropoff);
        const distanceKm = routeData.distance.value / 1000;

        const rates = PRICING[vehicleType] || PRICING['4 SEAT'];
        let fare = rates.BASE + (distanceKm * rates.PER_KM);
        fare = Math.round(fare * 100) / 100;

        const tripData = {
            riderId,
            pickupLocation: pickup,
            dropoffLocation: dropoff,
            vehicleType,
            paymentMethod,
            paymentStatus: 'PENDING',
            fare,
            fare_id,
            distance: routeData.distance.value,
            duration: routeData.duration.value,
            path: routeData.geometry,
            status: 'REQUESTED',
            createdAt: new Date().toISOString()
        };

        const result = await rideRepository.create(tripData);
        return new Trip(result.id, result);
    }

    // 1b. Estimate Trip
    async estimateTrip(pickup, dropoff, vehicleType) {
        const routeData = await mapsService.calculateRoute(pickup, dropoff);
        const nearbyDrivers = await this.getNearbyDriversWithETA(pickup);

        const distanceKm = routeData.distance.value / 1000;
        const rates = PRICING[vehicleType] || PRICING['4 SEAT'];
        let fare = rates.BASE + (distanceKm * rates.PER_KM);
        fare = Math.round(fare * 100) / 100;

        const fare_id = `fare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
            fare_id,
            pickupLocation: pickup,
            dropoffLocation: dropoff,
            vehicleType,
            fare,
            distance: routeData.distance.value,
            duration: routeData.duration.value,
            path: routeData.geometry,
            nearbyDrivers: nearbyDrivers.map(d => ({
                id: d.id,
                name: d.name,
                currentLocation: d.currentLocation,
                eta: d.eta,
                vehicle: d.vehicle
            }))
        };
    }

    // 2. Get Trip History for a specific User
    async getUserTripHistory(userId) {
        const trips = await rideRepository.findHistoryByUserId(userId);
        return trips.map(t => new Trip(t.id, t));
    }

    // 2c. Get Trip History for a specific Driver
    async getDriverTripHistory(driverId) {
        const trips = await rideRepository.findHistoryByDriverId(driverId);
        return trips.map(t => new Trip(t.id, t));
    }

    // 2b. Get current (active) trip for a user
    async getCurrentTripForUser(userId) {
        const trip = await rideRepository.findActiveTripForUser(userId);
        if (!trip) return null;
        return new Trip(trip.id, trip);
    }

    // 2d. Get available trips for drivers
    async getAvailableTrips(limit = 50) {
        const trips = await rideRepository.findAvailableTrips(limit);
        return trips.map(t => new Trip(t.id, t));
    }

    // 3. Cancel Trip
    async cancelTrip(tripId, userId) {
        const trip = await rideRepository.findById(tripId);
        if (!trip) throw new Error("Trip not found");
        if (trip.riderId !== userId) throw new Error("Unauthorized");

        if (!['REQUESTED', 'ACCEPTED'].includes(trip.status)) {
            throw new Error(`Cannot cancel a trip with status ${trip.status}. Only REQUESTED or ACCEPTED trips can be cancelled.`);
        }

        await rideRepository.update(tripId, {
            status: 'CANCELLED',
            cancelledAt: new Date().toISOString()
        });
        return { success: true, status: 'CANCELLED' };
    }

    // 4. Update Status
    async updateStatus(tripId, status, paymentStatus) {
        const updateData = { status };
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (status === 'COMPLETED') updateData.completedAt = new Date().toISOString();

        await rideRepository.update(tripId, updateData);
        return { success: true, status, paymentStatus: updateData.paymentStatus };
    }

    // 4a. Driver accepts a trip
    async acceptTrip(tripId, driverId) {
        const trip = await rideRepository.findById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.status !== 'REQUESTED') throw new Error(`Cannot accept trip with status ${trip.status}`);

        const result = await rideRepository.update(tripId, {
            status: 'ACCEPTED',
            driverId,
            acceptedAt: new Date().toISOString()
        });

        return new Trip(tripId, result);
    }

    // 4b. Driver marks pickup
    async markTripPickup(tripId, driverId) {
        const trip = await rideRepository.findById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.driverId !== driverId) throw new Error('Unauthorized');
        if (trip.status !== 'ACCEPTED') throw new Error(`Cannot mark pickup when status is ${trip.status}`);

        const result = await rideRepository.update(tripId, {
            status: 'IN_PROGRESS',
            pickupAt: new Date().toISOString()
        });

        return new Trip(tripId, result);
    }

    // 4c. Driver marks trip complete
    async markTripComplete(tripId, driverId) {
        const trip = await rideRepository.findById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.driverId !== driverId) throw new Error('Unauthorized');
        if (trip.status !== 'IN_PROGRESS') throw new Error(`Cannot complete trip when status is ${trip.status}`);

        const result = await rideRepository.update(tripId, {
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
            paymentStatus: trip.paymentStatus || 'PENDING'
        });

        return new Trip(tripId, result);
    }

    // 5. Get Trip Details by ID
    async getTrip(tripId) {
        const trip = await rideRepository.findById(tripId);
        if (!trip) throw new Error("Trip not found");
        return new Trip(tripId, trip);
    }
}

export default new TripService();