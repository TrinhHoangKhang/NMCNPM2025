const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const admin = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: 'adminpassword123',
            role: 'admin',
            realName: 'System Administrator'
        });

        console.log('Admin user created successfully:', admin.email);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
