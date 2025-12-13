const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'],
        default: 'requested'
    },
    pickupLocation: {
        address: String,
        coordinates: { type: [Number], required: true } // [lng, lat]
    },
    dropoffLocation: {
        address: String,
        coordinates: { type: [Number], required: true } // [lng, lat]
    },
    fare: { type: Number, required: true },
    distance: Number, // in meters
    duration: Number, // in seconds
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    rating: Number,
    feedback: String
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
