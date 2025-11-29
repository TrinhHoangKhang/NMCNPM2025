// src/services/driverService.js
const { db } = require('../config/firebaseConfig');
const Driver = require('../models/Driver');

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
}

module.exports = new DriverService(); // Export as Singleton