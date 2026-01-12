import { db } from '../config/firebaseConfig.js';

class OnlineQueueService {
    constructor() {
        this.queue = new Map(); // driverId -> timeoutId
        this.TTL = 1 * 60 * 1000; // 1 minute in milliseconds
    }

    add(driverId) {
        // If driver is already in queue, clear the old timeout (reset timer)
        if (this.queue.has(driverId)) {
            clearTimeout(this.queue.get(driverId));
        }

        console.log(`Driver ${driverId} added to Online Queue. Expires in 1 min.`);

        // Set automatic removal
        const timeoutId = setTimeout(() => {
            this.handleExpiry(driverId);
        }, this.TTL);

        this.queue.set(driverId, timeoutId);
    }

    remove(driverId) {
        if (this.queue.has(driverId)) {
            clearTimeout(this.queue.get(driverId));
            this.queue.delete(driverId);
            console.log(`Driver ${driverId} removed from Online Queue manually.`);
        }
    }

    async handleExpiry(driverId) {
        if (!this.queue.has(driverId)) return;

        this.queue.delete(driverId);
        console.log(`Driver ${driverId} expired from Online Queue. Setting to OFFLINE.`);

        try {
            // Update Firestore to Offline
            await db.collection('drivers').doc(driverId).update({ status: 'OFFLINE' });

            // Note: Ideally we should also notify the client via Socket.io here if possible,
            // but the client timer is the primary UI feedback.
        } catch (error) {
            console.error(`Failed to set driver ${driverId} offline after expiry:`, error);
        }
    }

    contains(driverId) {
        return this.queue.has(driverId);
    }
}

export default new OnlineQueueService();
