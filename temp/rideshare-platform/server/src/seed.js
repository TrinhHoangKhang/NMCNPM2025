const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars
dotenv.config();

// Models
const User = require('./models/User');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');

// Register missing discriminators for seeding purposes
// This ensures Mongoose doesn't complain when creating users with role 'admin' or 'rider'
// if they haven't been explicitly registered elsewhere.
const BaseDiscriminatorSchema = new mongoose.Schema({});
try {
    User.discriminator('admin', BaseDiscriminatorSchema);
} catch (e) {
    // Ignore if already registered
}

try {
    User.discriminator('rider', BaseDiscriminatorSchema);
} catch (e) {
    // Ignore if already registered
}

try {
    User.discriminator('driver', BaseDiscriminatorSchema);
} catch (e) {
    // Ignore if already registered
}

// Config
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rideshare';
const OUTPUT_FILE = path.join(__dirname, 'test_user.example');

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for Seeding');
    } catch (err) {
        console.error('DB Connection Fail:', err.message);
        process.exit(1);
    }
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedData = async () => {
    await connectDB();

    try {
        console.log('Clearing existing data...');
        // Clear via base model User clears Drivers too because of discriminator
        await User.deleteMany({});
        await Trip.deleteMany({});

        const outputLines = [];
        outputLines.push('# Test Accounts Created By Seed Script');
        outputLines.push(`# Date: ${new Date().toISOString()}`);
        outputLines.push('');

        // 1. Create Admin
        console.log('Creating Admin...');
        const admin = await User.create({
            username: 'admin',
            email: 'admin@rideshare.com',
            password: 'password123', // Will be hashed by pre-save
            role: 'admin',
            realName: 'System Administrator'
        });
        outputLines.push('## Admin');
        outputLines.push(`Username: ${admin.username}`);
        outputLines.push(`Email: ${admin.email}`);
        outputLines.push('Password: password123');
        outputLines.push('');

        // 2. Create 5 Users (Riders)
        console.log('Creating 5 Riders...');
        const riders = [];
        outputLines.push('## Riders');
        for (let i = 1; i <= 5; i++) {
            const rider = await User.create({
                username: `rider${i}`,
                email: `rider${i}@example.com`,
                phone: `+1555000${1000 + i}`,
                password: 'password123',
                role: 'rider',
                realName: `Test Rider ${i}`,
                walletBalance: getRandomInt(50, 500)
            });
            riders.push(rider);
            outputLines.push(`- Username: ${rider.username} / Email: ${rider.email} / Pass: password123`);
        }
        outputLines.push('');

        // 3. Create 3 Drivers
        console.log('Creating 3 Drivers...');
        const drivers = [];
        outputLines.push('## Drivers');
        const vehicleTypes = ['standard', 'premium', 'van'];
        const makes = ['Toyota', 'Honda', 'Ford', 'Tesla', 'Hyundai'];

        for (let i = 1; i <= 3; i++) {
            const driverIdx = i;
            // Driver needs to be created using Driver model to set discriminator key properly?
            // Actually, usually Model.create with discriminator logic works if using Base but better use Driver model directly
            // First create the User
            const user = await User.create({
                username: `driver${driverIdx}`,
                email: `driver${driverIdx}@example.com`,
                phone: `+1555999${1000 + driverIdx}`,
                password: 'password123',
                role: 'driver',
                realName: `Test Driver ${driverIdx}`
            });

            // Then create the Driver profile linked to the User
            const driver = await Driver.create({
                user: user._id,
                vehicle: {
                    make: getRandomItem(makes),
                    model: 'Sedan',
                    plateNumber: `CAB-${getRandomInt(100, 999)}`,
                    color: getRandomItem(['Black', 'White', 'Silver']),
                    type: getRandomItem(vehicleTypes)
                },
                isOnline: true,
                status: 'available',
                currentLocation: {
                    type: 'Point',
                    coordinates: [-73.935242 + (Math.random() * 0.01), 40.730610 + (Math.random() * 0.01)]
                }
            });
            drivers.push(driver);
            outputLines.push(`- Username: ${driver.username} / Email: ${driver.email} / Pass: password123 / Vehicle: ${driver.vehicle.make} ${driver.vehicle.model}`);
        }
        outputLines.push('');

        // 4. Create 10 History Logs (Trips)
        console.log('Creating 10 History Logs...');
        const statuses = ['completed', 'cancelled', 'completed', 'completed']; // weighted towards completed

        outputLines.push('## History Logs');
        for (let i = 1; i <= 10; i++) {
            const rider = getRandomItem(riders);
            const driver = getRandomItem(drivers);
            const status = getRandomItem(statuses);

            const trip = await Trip.create({
                rider: rider._id,
                driver: driver._id,
                status: status,
                pickupLocation: {
                    address: `${getRandomInt(100, 999)} Start Ave, NY`,
                    coordinates: [-73.935242, 40.730610]
                },
                dropoffLocation: {
                    address: `${getRandomInt(100, 999)} End Blvd, NY`,
                    coordinates: [-74.005974, 40.712776]
                },
                fare: getRandomInt(15, 60),
                distance: getRandomInt(2000, 15000),
                duration: getRandomInt(600, 2400),
                paymentStatus: status === 'completed' ? 'paid' : 'pending',
                rating: status === 'completed' ? getRandomInt(3, 5) : undefined,
                feedback: status === 'completed' ? 'Good ride' : undefined,
                createdAt: new Date(Date.now() - getRandomInt(0, 7 * 24 * 60 * 60 * 1000)) // Random time in last 7 days
            });
            outputLines.push(`- Log #${i}: ${status.toUpperCase()} | Rider: ${rider.username} | Driver: ${driver.username} | Fare: $${trip.fare} | Date: ${trip.createdAt.toISOString().split('T')[0]}`);
        }

        // Write output file
        fs.writeFileSync(OUTPUT_FILE, outputLines.join('\n'));
        console.log(`Seed data generated and saved to ${OUTPUT_FILE}`);

        process.exit();
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedData();
