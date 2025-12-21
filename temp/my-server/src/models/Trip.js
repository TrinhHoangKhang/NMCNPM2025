class Trip {
    constructor(id, data) {
        this.id = id;
        this.riderId = data.riderId;
        this.driverId = data.driverId || null;
        this.pickupLocation = data.pickupLocation; // { lat, lng, address }
        this.dropoffLocation = data.dropoffLocation; // { lat, lng, address }
        this.fare = data.fare || 0;
        this.distance = data.distance || 0; // in meters
        this.duration = data.duration || 0; // in seconds
        this.status = data.status || 'REQUESTED'; // REQUESTED, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            riderId: this.riderId,
            driverId: this.driverId,
            pickupLocation: this.pickupLocation,
            dropoffLocation: this.dropoffLocation,
            fare: this.fare,
            distance: this.distance,
            duration: this.duration,
            status: this.status,
            createdAt: this.createdAt
        };
    }
}

module.exports = Trip;
