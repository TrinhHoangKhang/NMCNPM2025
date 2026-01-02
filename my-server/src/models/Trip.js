class Trip {
    constructor(id, data) {
        this.id = id;
        this.riderId = data.riderId;
        this.driverId = data.driverId || null;
        this.pickupLocation = data.pickupLocation; // { lat, lng, address }
        this.dropoffLocation = data.dropoffLocation; // { lat, lng, address }
        this.vehicleType = data.vehicleType;
        this.fare = data.fare || 0;
        this.distance = data.distance || 0; // in meters
        this.duration = data.duration || 0; // in seconds
        this.path = data.path || null; // GeoJSON-like LineString with {lat,lng} coordinates
        this.status = data.status || 'REQUESTED'; // REQUESTED, ACCEPTED, IN_PROGRESS, COMPLETED
        this.createdAt = data.createdAt || new Date().toISOString();
        this.completedAt = data.completedAt || null;

        //Payment related
        this.paymentMethod = data.paymentMethod || "CASH"; // 'CASH', 'WALLET'
        this.paymentStatus = data.paymentStatus || "PENDING"; // 'PENDING', 'COMPLETED''

        this.ratingDriver = data.ratingDriver || null;
        this.ratingTrip = data.ratingTrip || null;
        this.ratingComment = data.ratingComment || null;
    }

    toJSON() {
        return {
            id: this.id,
            riderId: this.riderId,
            driverId: this.driverId,
            pickupLocation: this.pickupLocation,
            dropoffLocation: this.dropoffLocation,
            vehicleType: this.vehicleType,
            fare: this.fare,
            distance: this.distance,
            duration: this.duration,
            path: this.path,
            status: this.status,
            createdAt: this.createdAt,
            completedAt: this.completedAt,
            paymentMethod: this.paymentMethod,
            paymentStatus: this.paymentStatus,
            // Ratings
            ratingDriver: this.ratingDriver,
            ratingTrip: this.ratingTrip,
            ratingComment: this.ratingComment,

            // Populated fields
            driverName: this.driverName,
            driverRating: this.driverRating,
            vehiclePlate: this.vehiclePlate,
            vehicleModel: this.vehicleModel,
            vehicleColor: this.vehicleColor,
            driverPhone: this.driverPhone,
            driverEmail: this.driverEmail, // Added recently

            // Rider populated fields
            riderName: this.riderName,
            riderPhone: this.riderPhone,
            riderRating: this.riderRating,
            riderAvatar: this.riderAvatar,
            riderEmail: this.riderEmail
        };
    }
}

export default Trip;
