
import axios from 'axios';

const PORT = 3003;
const BASE_URL = `http://localhost:${PORT}/api`;

const generateUser = (role) => {
    const timestamp = Date.now();
    return {
        email: `ride_${role}_${timestamp}@example.com`,
        password: 'password123',
        name: `Ride ${role} ${timestamp}`,
        phone: `09${Math.floor(Math.random() * 100000000)}`,
        role: role
    };
};

async function authenticate(role) {
    const user = generateUser(role);
    try {
        await axios.post(`${BASE_URL}/auth/register`, user);
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: user.email,
            password: user.password
        });
        // Handle different token structures
        const token = res.data.token || res.data.user?.token;
        if (!token) throw new Error(`No token found for ${role}`);
        return { token, user: res.data.user || res.data.data };
    } catch (e) {
        console.error(`Auth failed for ${role}:`, e.response?.data || e.message);
        throw e;
    }
}

async function runTest() {
    console.log(`\n--- Starting Ride Flow Test on Port ${PORT} ---`);

    try {
        // 1. Auth
        console.log('1. Authenticating Rider & Driver...');
        const rider = await authenticate('rider');
        const driver = await authenticate('driver');
        console.log('   ✅ Rider token:', rider.token.substring(0, 10) + '...');
        console.log('   ✅ Driver token:', driver.token.substring(0, 10) + '...');

        // 2. Rider Request Trip
        console.log('\n2. Rider requesting trip...');
        const tripRequest = {
            pickupLocation: { lat: 10.762622, lng: 106.660172, address: "District 1" },
            dropoffLocation: { lat: 10.823099, lng: 106.629662, address: "Go Vap" },
            vehicleType: "MOTORBIKE",
            paymentMethod: "CASH"
        };

        const riderConfig = { headers: { Authorization: `Bearer ${rider.token}` } };
        const reqRes = await axios.post(`${BASE_URL}/trips/request`, tripRequest, riderConfig);
        const tripId = reqRes.data.data?._id || reqRes.data.trip?._id || reqRes.data._id; // Adjust based on actual response structure
        console.log('   ✅ Trip Requested. ID:', tripId);

        if (!tripId) throw new Error("Failed to get Trip ID");

        // 3. Driver Get Available Trips
        console.log('\n3. Driver checking available trips...');
        const driverConfig = { headers: { Authorization: `Bearer ${driver.token}` } };
        const availRes = await axios.get(`${BASE_URL}/trips/available`, driverConfig);

        const trips = availRes.data.data || availRes.data;
        console.log(`   ✅ Found ${trips.length} available trips`);

        const foundTrip = trips.find(t => t._id === tripId);
        if (!foundTrip) {
            console.log("   ⚠️  Created trip not found in available list. Maybe status mismatch?");
            // Attempt to continue anyway with known ID
        } else {
            console.log("   ✅ Target trip found in list.");
        }

        // 4. Driver Accept Trip
        console.log('\n4. Driver accepting trip...');
        const acceptRes = await axios.patch(`${BASE_URL}/trips/${tripId}/accept`, {}, driverConfig);
        console.log('   ✅ Trip Accepted. Status:', acceptRes.status);

        // 5. Driver Pickup
        console.log('\n5. Driver arriving at pickup...');
        await axios.patch(`${BASE_URL}/trips/${tripId}/pickup`, {}, driverConfig);
        console.log('   ✅ Pickup confirmed.');

        // 6. Driver Complete
        console.log('\n6. Driver completing trip...');
        await axios.patch(`${BASE_URL}/trips/${tripId}/complete`, {}, driverConfig);
        console.log('   ✅ Trip Completed.');

        console.log('\n--- 🎉 Ride Flow Test PASSED ---');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Test FAILED:', error.response?.data || error.message);
        if (error.response?.data) console.dir(error.response.data, { depth: null });
        process.exit(1);
    }
}

runTest();
