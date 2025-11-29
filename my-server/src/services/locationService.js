// src/services/locationService.js
const { db } = require('../config/firebaseConfig');

class LocationService {

    // 1. Update Driver's real-time coordinates
    async updateCoordinates(driverId, lat, lng) {
        await db.collection('drivers').doc(driverId).update({
            currentLocation: { lat, lng },
            lastUpdated: new Date()
        });
    }

    // 2. Find Nearest Drivers (Simplistic version)
    // Note: For production, use 'Geofire' or Firestore GeoQueries
    async findNearbyDrivers(riderLat, riderLng, radiusKm) {
        const driversRef = db.collection('drivers').where('status', '==', 'ONLINE');
        const snapshot = await driversRef.get();
        
        const nearby = [];
        snapshot.forEach(doc => {
            const driver = doc.data();
            if (driver.currentLocation) {
                const distance = this._calculateDistance(riderLat, riderLng, driver.currentLocation.lat, driver.currentLocation.lng);
                if (distance <= radiusKm) {
                    nearby.push(driver);
                }
            }
        });
        return nearby;
    }

    // Helper: Haversine Formula for distance
    _calculateDistance(lat1, lon1, lat2, lon2) {
        // Math logic to calculate distance between two points...
        return 5.2; // returning dummy 5.2km for example
    }
}

module.exports = new LocationService();