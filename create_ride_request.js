
const API_URL = 'http://localhost:3001/api';

async function createRide() {
    try {
        // 1. Login as Rider
        console.log("Logging in as Rider...");
        // Use a known rider or create one. I'll use a hardcoded one or register one if needed.
        // Assuming 'rider_test_auto@example.com' doesn't exist, I'll register it first to be safe.
        // Actually, let's just use the register endpoint to ensure we have a valid user.

        const timestamp = Date.now();
        const email = `rider_${timestamp}@example.com`;
        const password = 'password123';

        await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Auto Rider",
                email,
                password,
                phone: "0999999999",
                role: "RIDER"
            })
        });

        // 2. Login
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        const token = loginData.user.token;
        console.log(`Rider logged in: ${email}`);

        // 3. Estimate Price (Optional but good for flow)
        const estimateBody = {
            pickupLocation: { lat: 10.762622, lng: 106.660172, address: "University of Science" },
            dropoffLocation: { lat: 10.776889, lng: 106.700806, address: "Ben Thanh Market" },
            vehicleType: "MOTORBIKE"
        };

        // 4. Request Trip
        console.log("Requesting Trip...");
        const requestRes = await fetch(`${API_URL}/trips/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                ...estimateBody,
                paymentMethod: "CASH"
            })
        });

        const requestData = await requestRes.json();
        if (requestData.success) {
            console.log("TRIP CREATED SUCCESSFULLY!");
            console.log("Trip ID:", requestData.data.trip.id);
        } else {
            console.error("Trip Request Failed:", requestData);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

createRide();
