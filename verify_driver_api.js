
const API_URL = 'http://localhost:3001/api';

async function verifyDriverAPI() {
    try {
        console.log("1. Registering/Login Driver...");
        const timestamp = Date.now();
        const email = `driver_${timestamp}@example.com`;
        const password = 'password123';

        // Register
        await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Auto Driver",
                email,
                password,
                phone: "0988888888",
                role: "DRIVER"
            })
        });

        // Login
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        const token = loginData.user.token;
        console.log(`Driver logged in: ${email}`);

        // Go Online
        console.log("2. Going Online...");
        await fetch(`${API_URL}/drivers/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'ONLINE' })
        });

        // Fetch Available Trips
        console.log("3. Fetching Available Trips...");
        const tripsRes = await fetch(`${API_URL}/trips/available`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tripsData = await tripsRes.json();

        if (!tripsData.success) {
            throw new Error("Failed to fetch trips");
        }

        const trips = tripsData.data;
        console.log(`Found ${trips.length} available trips.`);

        if (trips.length > 0) {
            console.log("SUCCESS: Driver can see available trips.");
            console.log("First Trip:", trips[0].pickupLocation);
        } else {
            console.warn("WARNING: No trips found. Ensure create_ride_request.js ran successfully.");
        }

    } catch (e) {
        console.error("Verification Error:", e);
        process.exit(1);
    }
}

verifyDriverAPI();
