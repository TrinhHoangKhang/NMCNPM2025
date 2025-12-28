// src/services/driverService.js
import { db  } from '../config/firebaseConfig.js';
import Driver from '../models/Driver.js';

class DriverService {

    // 1. Register a new driver
    async registerDriver(uid, rawData) {
        // Validation logic here...
        const newDriver = new Driver(uid, rawData);

        // Save to Firebase 'drivers' collection
        await db.collection('drivers').doc(uid).set(newDriver.toJSON());
        return newDriver;
    }

    // 2. Toggle Status (Online/Offline)
    async updateStatus(driverId, newStatus) {
        // Business Rule: Can't go online without a vehicle
        const doc = await db.collection('drivers').doc(driverId).get();
        if (!doc.exists) throw new Error("Driver not found");

        if (newStatus === 'ONLINE' && !doc.data().vehicle) {
            throw new Error("Cannot go online without a vehicle registered");
        }

        await db.collection('drivers').doc(driverId).update({ status: newStatus });
        return { success: true, status: newStatus };
    }
    // 3. Get Driver Profile
    async getDriver(driverId) {
        const doc = await db.collection('drivers').doc(driverId).get();
        if (!doc.exists) throw new Error("Driver not found");
        return doc.data();
    }

    // 4. Update Driver Profile
    async updateDriver(driverId, updates) {
        const docRef = db.collection('drivers').doc(driverId);
        await docRef.update(updates);
        const updatedDoc = await docRef.get();
        return updatedDoc.data();
    }

    // 5. Update Location
    async updateLocation(driverId, lat, lng) {
        await db.collection('drivers').doc(driverId).update({
            currentLocation: { lat, lng }
        });
        return { success: true, lat, lng };
    }
}

export default new DriverService(); // Export as Singleton