// src/models/Driver.js
import User from './User.js';
import Vehicle from './Vehicle.js';

class Driver extends User {
    constructor(id, data) {
        super(id, data); // Call the parent constructor

        this.licenseNumber = data.licenseNumber;
        this.status = data.status || 'OFFLINE'; // OFFLINE, ONLINE, BUSY
        this.rating = data.rating || 5.0;
        this.walletBalance = data.walletBalance || 0;

        // Composition: A Driver HAS A Vehicle
        this.vehicle = data.vehicle ? new Vehicle(data.vehicle) : null;

        // GeoPoint: { lat: 10.123, lng: 106.456 }
        this.currentLocation = data.currentLocation || null;
    }

    // Method to check if driver can accept a ride
    isAvailable() {
        return this.status === 'ONLINE' && this.vehicle !== null;
    }

    // Method to sanitize data before saving to Firebase
    toJSON() {
        return {
            name: this.name,
            email: this.email,
            phone: this.phone,
            licenseNumber: this.licenseNumber,
            status: this.status,
            rating: this.rating,
            currentLocation: this.currentLocation,
            vehicle: this.vehicle // Stores the vehicle object inside
        };
    }
}
export default Driver;