const mongoose = require('mongoose');

// This is the "blueprint"
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true, // Automatically remove whitespace
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// This creates the "Model" that you can use to query the database
const User = mongoose.model('User', userSchema);

module.exports = User;