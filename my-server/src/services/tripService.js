import { db, admin } from '../config/firebaseConfig.js';
import Trip from '../models/Trip.js';
import mapsService from './mapsService.js';
import rankingService from './rankingService.js';
import driverService from './driverService.js';
//const { v4: uuidv4 } = require('uuid'); // Need to install uuid, or just use Firestore auto-ID

// Pricing Config (could be a separate file)
// Pricing Config (loaded from .env)
const PRICING = {
    'Motorbike': {
        BASE: parseFloat(process.env.PRICE_BASE_MOTORBIKE || '1.00'),
        PER_KM: parseFloat(process.env.PRICE_KM_MOTORBIKE || '0.50')
    },
    'Car 4-Seat': {
        BASE: parseFloat(process.env.PRICE_BASE_4SEAT || '2.00'),
        PER_KM: parseFloat(process.env.PRICE_KM_4SEAT || '1.00')
    },
    'Car 7-Seat': {
        BASE: parseFloat(process.env.PRICE_BASE_7SEAT || '5.00'),
        PER_KM: parseFloat(process.env.PRICE_KM_7SEAT || '2.00')
    }
};


class TripService {

    // Helper: Fetch driver details and merge into trip
    async _populateDriverDetails(trip) {
        if (!trip.driverId) return trip;

        try {
            let dData = null;
            const driverDoc = await db.collection('drivers').doc(trip.driverId).get();

            if (driverDoc.exists) {
                dData = driverDoc.data();
            } else {
                console.warn(`Driver doc ${trip.driverId} missing for trip ${trip.id}. Trying users collection.`);
                const userDoc = await db.collection('users').doc(trip.driverId).get();
                if (userDoc.exists) {
                    dData = userDoc.data();
                    // Users collection might not have vehicle info
                }
            }

            if (dData) {
                // Inject driver info.
                trip.driverName = dData.name || "Unknown Driver";
                trip.driverRating = dData.rating || 5.0;
                trip.vehiclePlate = dData.vehicle?.plate || dData.licensePlate; // Fallback
                trip.vehicleModel = dData.vehicle?.model || "Standard";
                trip.vehicleColor = dData.vehicle?.color || "White";
                trip.driverPhone = dData.phone;
            }
        } catch (e) {
            console.error(`Failed to populate driver for trip ${trip.id}:`, e);
        }
        return trip;
    }

    // 0. Get All Trips (Admin)
    async getAllTrips() {
        const snapshot = await db.collection('trips').orderBy('createdAt', 'desc').get();
        const trips = snapshot.docs.map(doc => new Trip(doc.id, doc.data()));
        return Promise.all(trips.map(t => this._populateDriverDetails(t)));
    }

    // 1. Create a Trip Request
    async createTripRequest(riderId, pickup, dropoff, vehicleType, paymentMethod) {
        // ... (existing code omitted for brevity, assuming it's unchanged unless I am rewriting the whole file)
        // Check if user already has an active trip
        const existingTrip = await this.getCurrentTripForUser(riderId);
        if (existingTrip) {
            // throw new Error("Cant create new trip: existing active trip found");
            // Allow for dev/testing ease or check status rigorously
        }

        const routeData = await mapsService.calculateRoute(pickup, dropoff);

        // Calculate the distance in KM
        const distanceKm = routeData.distance.value / 1000;

        // B. Calculate Fare based on vehicle type
        const rates = PRICING[vehicleType] || PRICING['Car 4-Seat'];
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

    // 1b. Estimate Trip Price & Distance
    async estimateTrip(pickup, dropoff, vehicleType, distanceOverride = null) {
        let distanceKm = 0;
        let durationMin = 0;

        if (distanceOverride) {
            // Use client-provided distance if verified/trusted logic allows
            distanceKm = parseFloat(distanceOverride);
            // Estimate duration roughly if not provided (e.g. 30km/h avg)
            durationMin = Math.round((distanceKm / 30) * 60);
        } else {
            // Calculate route
            const routeData = await mapsService.calculateRoute(pickup, dropoff);
            // Distance in KM
            distanceKm = routeData.distance.value / 1000;
            durationMin = Math.round(routeData.duration.value / 60);
        }

        // Calculate Fare
        const rates = PRICING[vehicleType] || PRICING['Car 4-Seat'];
        let fare = rates.BASE + (distanceKm * rates.PER_KM);
        fare = Math.round(fare * 1000); // Standardize to integer VND (e.g. 15000)

        // Ensure minimum fare? (Optional logic, let's keep it simple)
        if (fare < rates.BASE * 1000) fare = rates.BASE * 1000;

        return {
            distance: distanceKm.toFixed(1), // km string
            duration: durationMin, // min
            price: fare,
            currency: 'VND'
        };
    }

    // 2. Get Trip History for a specific User
    async getUserTripHistory(userId) {
        const snapshot = await db.collection('trips')
            .where('riderId', '==', userId)
            .get();

        const trips = snapshot.docs.map(doc => new Trip(doc.id, doc.data()));
        const populatedTrips = await Promise.all(trips.map(t => this._populateDriverDetails(t)));

        return populatedTrips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // 2c. Get Trip History for a specific Driver
    async getDriverTripHistory(driverId) {
        const snapshot = await db.collection('trips')
            .where('driverId', '==', driverId)
            .get();

        const trips = snapshot.docs.map(doc => new Trip(doc.id, doc.data()));
        // For driver history, maybe populate Rider details? But for now lets stick to standard.
        // Usually drivers want to see who they drove, so populating riderName might be good too, but out of scope for "Driver Detail in Rider" request.
        return trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // 2b. Get current (active) trip for a user
    async getCurrentTripForUser(userId) {
        // 1. Check if user is a DRIVER
        const driverQuery = db.collection('trips')
            .where('driverId', '==', userId)
            .where('status', 'in', ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'])
            .limit(1);

        const driverSnap = await driverQuery.get();
        if (!driverSnap.empty) {
            const trip = new Trip(driverSnap.docs[0].id, driverSnap.docs[0].data());
            // Populate rider info?
            return trip;
        }

        // 2. Check if user is a RIDER
        const riderQuery = db.collection('trips')
            .where('riderId', '==', userId)
            .where('status', 'in', ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'])
            .limit(1);

        const riderSnap = await riderQuery.get();
        if (!riderSnap.empty) {
            const trip = new Trip(riderSnap.docs[0].id, riderSnap.docs[0].data());
            return await this._populateDriverDetails(trip);
        }

        return null;
    }

    // 4. Get Available Trips (Requested & Pending)
    async getAvailableTrips(vehicleTypeFilter = null) {
        let query = db.collection('trips')
            .where('status', '==', 'REQUESTED');
        // .orderBy('createdAt', 'desc'); // Commenting out to avoid manual index creation requirement during dev

        if (vehicleTypeFilter) {
            // Precise match: 'Motorbike' drivers only see 'Motorbike' requests
            // 'Car 4-Seat' drivers -> 'Car 4-Seat' requests.
            // If we want 'Car 7-Seat' to also see 'Car 4-Seat', we need logic here.
            // For now, strict match as requested.
            query = query.where('vehicleType', '==', vehicleTypeFilter);
        }

        const snapshot = await query.get();
        const trips = snapshot.docs.map(doc => new Trip(doc.id, doc.data()));

        // Manual Sort (In-Memory) to bypass Firestore Index requirement
        trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return trips;
    }

    // 3. PATCH /api/trips/cancel
    async cancelTrip(tripId, userId) {
        const tripRef = db.collection('trips').doc(tripId);
        const doc = await tripRef.get();
        if (!doc.exists) throw new Error("Trip not found");

        const tripData = doc.data();
        // Allow rider or driver involved to cancel? Or just creator?
        // Usually rider cancels request. Driver cancels if accepted?
        // Let's assume standard permission: check if userId matches riderId or driverId
        if (tripData.riderId !== userId && tripData.driverId !== userId) {
            throw new Error("Unauthorized to cancel this trip");
        }

        if (['CANCELLED', 'COMPLETED'].includes(tripData.status)) {
            throw new Error("Trip is already finished");
        }

        await tripRef.update({
            status: 'CANCELLED',
            cancelledBy: userId,
            cancelledAt: new Date().toISOString()
        });

        const updated = await tripRef.get();

        if (updated.data().status === 'CANCELLED') {
            // Revert Driver if assigned
            const dId = updated.data().driverId;
            if (dId) {
                await driverService.updateStatus(dId, 'ONLINE').catch(err => console.error("Cancel Trip Status Error:", err));
            }
        }

        return { id: tripId, ...updated.data() };
    }

    async updateStatus(tripId, status) {
        const tripRef = db.collection('trips').doc(tripId);
        await tripRef.update({ status, updatedAt: new Date().toISOString() });
        const updated = await tripRef.get();
        return { id: tripId, ...updated.data() };
    }

    // 4a. Driver accepts a trip
    async acceptTrip(tripId, driverId, driverVehicleType) {
        const tripRef = db.collection('trips').doc(tripId);
        const doc = await tripRef.get();
        if (!doc.exists) throw new Error('Trip not found');

        const data = doc.data();
        if (data.status !== 'REQUESTED') {
            throw new Error(`Cannot accept trip with status ${data.status}`);
        }

        // Validate Vehicle Type
        // We ensure the driver's vehicle MATCHES the requested type.
        // Normalize strings to ensure case-insensitivity (e.g. 'Motorbike' vs 'MOTORBIKE')
        if (driverVehicleType && data.vehicleType) {
            const driverType = driverVehicleType.toUpperCase();
            const requiredType = data.vehicleType.toUpperCase();

            if (driverType !== requiredType) {
                throw new Error(`Vehicle type mismatch. Required: ${data.vehicleType}, Yours: ${driverVehicleType}`);
            }
        }

        await tripRef.update({
            status: 'ACCEPTED',
            driverId,
            acceptedAt: new Date().toISOString()
        });

        // Update Driver Status to WORKING
        await driverService.updateStatus(driverId, 'WORKING');

        const updated = await tripRef.get();
        const trip = new Trip(tripId, updated.data());
        return await this._populateDriverDetails(trip);
    }

    // ... (keep markTripPickup, markTripComplete same but maybe return populate?)
    async markTripPickup(tripId, driverId) {
        const tripRef = db.collection('trips').doc(tripId);
        // ... validation
        const doc = await tripRef.get();
        if (!doc.exists) throw new Error('Trip not found');
        const data = doc.data();
        if (data.driverId !== driverId) throw new Error('Unauthorized');

        await tripRef.update({
            status: 'IN_PROGRESS',
            pickupAt: new Date().toISOString()
        });

        const updated = await tripRef.get();
        const trip = new Trip(tripId, updated.data());
        return await this._populateDriverDetails(trip);
    }

    async markTripComplete(tripId, driverId, paymentStatusOverride = null) {
        const tripRef = db.collection('trips').doc(tripId);
        // ... validation
        const doc = await tripRef.get();
        if (!doc.exists) throw new Error('Trip not found');
        const data = doc.data();
        if (data.driverId !== driverId) throw new Error('Unauthorized');

        await tripRef.update({
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
            paymentStatus: paymentStatusOverride || data.paymentStatus || 'PENDING'
        });

        // NEW: Increment Trip Count for Driver (DB + Redis)
        try {
            // 1. DB Increment (Atomic)
            const driverRef = db.collection('drivers').doc(driverId);
            await driverRef.update({
                tripCount: admin.firestore.FieldValue.increment(1)
            });

            // 2. Redis Ranking
            await rankingService.updateScore(driverId, 1);

        } catch (err) {
            console.error(`Failed to update stats for driver ${driverId}:`, err);
            // Non-blocking error
            // Non-blocking error
        }

        // Revert Driver Status to ONLINE
        await driverService.updateStatus(driverId, 'ONLINE');

        const updated = await tripRef.get();
        const trip = new Trip(tripId, updated.data());

        return await this._populateDriverDetails(trip);
    }

    // 5. Get Trip Details by ID
    async getTrip(tripId) {
        console.log("Fetching trip with ID:", tripId);
        const doc = await db.collection('trips').doc(tripId).get();
        if (!doc.exists) throw new Error("Trip not found");
        const trip = new Trip(tripId, doc.data());
        return await this._populateDriverDetails(trip);
    }
}

export default new TripService();