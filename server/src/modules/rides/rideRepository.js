import { db } from '../../core/loaders/firebaseLoader.js';

class RideRepository {
    constructor() {
        this.collection = db.collection('trips');
    }

    async findById(tripId) {
        const doc = await this.collection.doc(tripId).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    async create(tripData) {
        const docRef = this.collection.doc();
        await docRef.set(tripData);
        return { id: docRef.id, ...tripData };
    }

    async update(tripId, updates) {
        await this.collection.doc(tripId).update(updates);
        return this.findById(tripId);
    }

    async findActiveTripForUser(userId) {
        const snapshot = await this.collection
            .where('riderId', '==', userId)
            .where('status', 'in', ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'])
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    async findHistoryByUserId(userId) {
        const snapshot = await this.collection
            .where('riderId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async findHistoryByDriverId(driverId) {
        const snapshot = await this.collection
            .where('driverId', '==', driverId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async findAvailableTrips(limit = 50) {
        const snapshot = await this.collection
            .where('status', '==', 'REQUESTED')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}

export default new RideRepository();
