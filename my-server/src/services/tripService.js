const { db } = require('../config/firebaseConfig');
const Trip = require('../models/Trip');
const mapsService = require('./mapsService');
const { v4: uuidv4 } = require('uuid'); // Need to install uuid, or just use Firestore auto-ID

// Pricing Config (could be a separate file)
const PRICING = {
    BASE_FARE: 2.00,
    PER_KM: 1.00,
    PER_MINUTE: 0.25
};

class TripService {

    // 1. Create a Trip Request
    async createTripRequest(riderId, pickup, dropoff) {
        // A. Calculate Route Details
        // origin/dest can be "lat,lng" strings
        const routeData = await mapsService.calculateRoute(
            `${pickup.lat},${pickup.lng}`,
            `${dropoff.lat},${dropoff.lng}`
        );

        const distanceKm = routeData.distance.value / 1000;
        const durationMin = routeData.duration.value / 60;

        // B. Calculate Fare
        let fare = PRICING.BASE_FARE +
            (distanceKm * PRICING.PER_KM) +
            (durationMin * PRICING.PER_MINUTE);

        fare = Math.round(fare * 100) / 100; // Round to 2 decimal places

        // C. Save to DB
        // We let Firestore generate the ID or use uuid
        const tripRef = db.collection('trips').doc();

        const tripData = {
            riderId,
            pickupLocation: pickup,
            dropoffLocation: dropoff,
            fare,
            distance: routeData.distance.text,
            duration: routeData.duration.text,
            status: 'REQUESTED',
            createdAt: new Date().toISOString()
        };

        const newTrip = new Trip(tripRef.id, tripData);
        await tripRef.set(newTrip.toJSON());

        return newTrip;
    }

    // 2. Accept a Trip (Driver)
    async acceptTrip(tripId, driverId) {
        const tripRef = db.collection('trips').doc(tripId);
        const doc = await tripRef.get();

        if (!doc.exists) throw new Error("Trip not found");
        if (doc.data().status !== 'REQUESTED') throw new Error("Trip is no longer available");

        await tripRef.update({
            status: 'ACCEPTED',
            driverId: driverId
        });

        return { success: true, tripId, status: 'ACCEPTED', driverId };
    }

    // 3. Update Status (Progress/Complete)
    async updateStatus(tripId, status) {
        const VALID_STATUSES = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        if (!VALID_STATUSES.includes(status)) throw new Error("Invalid status");

        await db.collection('trips').doc(tripId).update({ status });
        return { success: true, tripId, status };
    }

    // 4. Get Trip Details
    async getTrip(tripId) {
        const doc = await db.collection('trips').doc(tripId).get();
        if (!doc.exists) throw new Error("Trip not found");
        return new Trip(tripId, doc.data());
    }
}

module.exports = new TripService();
