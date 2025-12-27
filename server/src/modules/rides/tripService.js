import { db } from '../../core/loaders/firebaseLoader.js';
import Trip from './tripModel.js';
import mapsService from '../maps/mapsService.js';
import locationService from '../../shared/services/locationService.js';

// Pricing Config (could be a separate file)
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
        // 1. Get the closest N drivers by Euclidean distance (fast pruning)
        const candidates = await locationService.findNearbyDrivers(
            pickupLocation.lat,
            pickupLocation.lng,
            radiusKm,
            limit
        );

        if (candidates.length === 0) return [];

        // 2. Use Distance Matrix to get real arrival times (ETAs)
        const origins = candidates.map(d => d.currentLocation);
        const destinations = [pickupLocation];

        const matrix = await mapsService.getDistanceMatrix(origins, destinations);

        if (!matrix) {
            // Fallback to Euclidean sorting if API key is missing or fails
            return candidates;
        }

        // 3. Enrich candidates with ETA data
        const enriched = candidates.map((driver, index) => {
            const result = matrix.rows[index]?.elements[0]; // element for this driver to this pickup
            if (result && result.status === 'OK') {
                return {
                    ...driver,
                    eta: {
                        text: result.duration.text,
                        value: result.duration.value // seconds
                    },
                    travelDistance: {
                        text: result.distance.text,
                        value: result.distance.value // meters
                    }
                };
            }
            return driver;
        });

        // 4. Sort by ETA (lowest first)
        return enriched.sort((a, b) => {
            const etaA = a.eta?.value || Infinity;
            const etaB = b.eta?.value || Infinity;
            return etaA - etaB;
        });
    }

    // 1. Create a Trip Request (Updated with Role Check and fare_id)
    async createTripRequest(riderId, pickup, dropoff, vehicleType, paymentMethod, fare_id) {
        // Validation: Verify if the user is actually a rider (Optional: depends on if we trust middleware)
        const userDoc = await db.collection('users').doc(riderId).get();
        if (!userDoc.exists || userDoc.data().role !== 'RIDER') {
            throw new Error("Only users with role RIDER can request a trip");
        }

        // Check if user already has an active trip
        const existingTrip = await this.getCurrentTripForUser(riderId);
        if (existingTrip) {
            throw new Error("Cant create new trip: existing active trip found");
        }

        const routeData = await mapsService.calculateRoute(pickup, dropoff);

        // Calculate the distance in KM
        const distanceKm = routeData.distance.value / 1000;

        // B. Calculate Fare based on vehicle type
        const rates = PRICING[vehicleType] || PRICING['4 SEAT'];
        let fare = rates.BASE + (distanceKm * rates.PER_KM);
        fare = Math.round(fare * 100) / 100;

        // C. Save to DB
        const tripRef = db.collection('trips').doc();
        const tripData = {
            riderId,
            pickupLocation: pickup,
            dropoffLocation: dropoff,
            vehicleType,
            paymentMethod,
            paymentStatus: 'PENDING',
            fare,
            fare_id, // Link to estimate if provided
            distance: routeData.distance.value,
            duration: routeData.duration.value,
            path: routeData.geometry,
            status: 'REQUESTED',
            createdAt: new Date().toISOString()
        };

        const newTrip = new Trip(tripRef.id, tripData);
        await tripRef.set(newTrip.toJSON());

        return newTrip;
    }

    // 1b. Estimate Trip (Before creating a request)
    async estimateTrip(pickup, dropoff, vehicleType) {
        const routeData = await mapsService.calculateRoute(pickup, dropoff);
        const nearbyDrivers = await this.getNearbyDriversWithETA(pickup);

        const distanceKm = routeData.distance.value / 1000;
        const rates = PRICING[vehicleType] || PRICING['4 SEAT'];
        let fare = rates.BASE + (distanceKm * rates.PER_KM);
        fare = Math.round(fare * 100) / 100;

        // Generate a simple fare_id (e.g., date + random)
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
        const snapshot = await db.collection('trips')
            .where('riderId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => new Trip(doc.id, doc.data()));
    }

    // 2c. Get Trip History for a specific Driver
    async getDriverTripHistory(driverId) {
        const snapshot = await db.collection('trips')
            .where('driverId', '==', driverId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => new Trip(doc.id, doc.data()));
    }

    // 2b. Get current (active) trip for a user
    async getCurrentTripForUser(userId) {
        const query = db.collection('trips')
            .where('riderId', '==', userId)
            .where('status', 'in', ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'])
            .orderBy('createdAt', 'desc')
            .limit(1);

        const snapshot = await query.get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new Trip(doc.id, doc.data());
    }

    // 2d. Get available trips for drivers (status REQUESTED)
    async getAvailableTrips(limit = 50) {
        const snapshot = await db.collection('trips')
            .where('status', '==', 'REQUESTED')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => new Trip(doc.id, doc.data()));
    }

    // 3. Cancel Trip (User Action)
    async cancelTrip(tripId, userId) {
        const tripRef = db.collection('trips').doc(tripId);
        const doc = await tripRef.get();

        if (!doc.exists) throw new Error("Trip not found");
        if (doc.data().riderId !== userId) throw new Error("Unauthorized");

        // LOG
        console.log(`Cancelling trip ${tripId} for user ${userId}`);

        // Can only cancel if status is REQUESTED or ACCEPTED
        const currentStatus = doc.data().status;
        if (!['REQUESTED', 'ACCEPTED'].includes(currentStatus)) {
            throw new Error(`Cannot cancel a trip with status ${currentStatus}. Only REQUESTED or ACCEPTED trips can be cancelled.`);
        }

        // Soft delete: update status to CANCELLED instead of hard delete
        await tripRef.update({
            status: 'CANCELLED',
            cancelledAt: new Date().toISOString()
        });
        return { success: true, status: 'CANCELLED' };
    }

    // 4. Update Status (Driver Action - with Payment Logic)
    async updateStatus(tripId, status, paymentStatus) {
        const tripRef = db.collection('trips').doc(tripId);
        const updateData = { status };

        if (paymentStatus) {
            updateData.paymentStatus = paymentStatus;
        }

        if (status === 'COMPLETED') {
            updateData.completedAt = new Date().toISOString();
            // Logic for E-Wallet payment would be triggered here
        }

        await tripRef.update(updateData);
        return { success: true, status, paymentStatus: updateData.paymentStatus };
    }

    // 4a. Driver accepts a trip
    async acceptTrip(tripId, driverId) {
        const tripRef = db.collection('trips').doc(tripId);
        const doc = await tripRef.get();
        if (!doc.exists) throw new Error('Trip not found');

        const data = doc.data();
        if (data.status !== 'REQUESTED') {
            throw new Error(`Cannot accept trip with status ${data.status}`);
        }

        await tripRef.update({
            status: 'ACCEPTED',
            driverId,
            acceptedAt: new Date().toISOString()
        });

        const updated = await tripRef.get();
        return new Trip(tripId, updated.data());
    }

    // 4b. Driver marks pickup (arrived / ride started)
    async markTripPickup(tripId, driverId) {
        const tripRef = db.collection('trips').doc(tripId);
        const doc = await tripRef.get();
        if (!doc.exists) throw new Error('Trip not found');

        const data = doc.data();
        if (data.driverId !== driverId) throw new Error('Unauthorized');
        if (data.status !== 'ACCEPTED') {
            throw new Error(`Cannot mark pickup when status is ${data.status}`);
        }

        await tripRef.update({
            status: 'IN_PROGRESS',
            pickupAt: new Date().toISOString()
        });

        const updated = await tripRef.get();
        return new Trip(tripId, updated.data());
    }

    // 4c. Driver marks trip complete
    async markTripComplete(tripId, driverId) {
        const tripRef = db.collection('trips').doc(tripId);
        const doc = await tripRef.get();
        if (!doc.exists) throw new Error('Trip not found');

        const data = doc.data();
        if (data.driverId !== driverId) throw new Error('Unauthorized');
        if (data.status !== 'IN_PROGRESS') {
            throw new Error(`Cannot complete trip when status is ${data.status}`);
        }

        await tripRef.update({
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
            paymentStatus: data.paymentStatus || 'PENDING'
        });

        const updated = await tripRef.get();
        return new Trip(tripId, updated.data());
    }

    // 5. Get Trip Details by ID
    async getTrip(tripId) {
        console.log("Fetching trip with ID:", tripId);
        const doc = await db.collection('trips').doc(tripId).get();
        if (!doc.exists) throw new Error("Trip not found");
        return new Trip(tripId, doc.data());
    }
}

export default new TripService();