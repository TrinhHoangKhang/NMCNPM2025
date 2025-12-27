// src/services/locationService.js
import { db } from '../../core/loaders/firebaseLoader.js';

class LocationService {

    // 1. Update Driver's real-time coordinates
    async updateCoordinates(driverId, lat, lng) {
        await db.collection('drivers').doc(driverId).update({
            currentLocation: { lat, lng },
            lastUpdated: new Date()
        });
    }

    // 2. Find Nearest Drivers
    async findNearbyDrivers(riderLat, riderLng, radiusKm, limit = 10) {
        const driversRef = db.collection('drivers').where('status', '==', 'ONLINE');
        const snapshot = await driversRef.get();

        const nearby = [];
        snapshot.forEach(doc => {
            const driver = doc.data();
            if (driver.currentLocation) {
                const distance = this._calculateDistance(riderLat, riderLng, driver.currentLocation.lat, driver.currentLocation.lng);
                if (distance <= radiusKm) {
                    nearby.push({
                        ...driver,
                        id: doc.id,
                        calculatedDistance: distance // distance in km
                    });
                }
            }
        });

        // Sort by Euclidean distance first (Geospatial pruning)
        // Then return only the top N closest candidates
        return nearby
            .sort((a, b) => a.calculatedDistance - b.calculatedDistance)
            .slice(0, limit);
    }

    // Helper: Haversine Formula for distance (in KM)
    _calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = this._deg2rad(lat2 - lat1);
        const dLon = this._deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this._deg2rad(lat1)) * Math.cos(this._deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    _deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
}

export default new LocationService();