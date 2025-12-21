const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    vehicle: {
        make: String,
        model: String,
        plateNumber: String,
        color: String,
        type: { type: String, enum: ['standard', 'premium', 'van'], default: 'standard' }
    },
    isOnline: { type: Boolean, default: false },
    currentLocation: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
    },
    status: { type: String, enum: ['available', 'busy'], default: 'available' },
    earnings: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 } // Moved rating here for Driver specific rating, or can sync with User
}, { timestamps: true });

DriverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', DriverSchema);
