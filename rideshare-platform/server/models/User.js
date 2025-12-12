const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    realName: { type: String, default: '' },
    location: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    phone: { type: String, required: false, unique: true, sparse: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['rider', 'driver', 'admin'], default: 'rider' },
    rating: { type: Number, default: 5.0 },
    walletBalance: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    achievements: [{
        title: String,
        description: String,
        date: { type: Date, default: Date.now }
    }],
    savedLocations: [{
        label: String,
        address: String,
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    }]
}, { timestamps: true, discriminatorKey: 'role' });

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
