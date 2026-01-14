import tripService from './src/services/tripService.js';
import { db } from './src/config/firebaseConfig.js';

async function test() {
    try {
        console.log("Fetching trips...");
        const trips = await tripService.getAllTrips();
        console.log(`Found ${trips.length} trips.`);

        if (trips.length > 0) {
            const firstTrip = trips[0];
            const json = firstTrip.toJSON();
            console.log("First Trip Data:");
            console.log(JSON.stringify(json, null, 2));

            // Check specific fields
            console.log("--------------------------------");
            console.log("Rider Name:", json.riderName);
            console.log("Driver Name:", json.driverName);
            console.log("Rider ID:", json.riderId);
            console.log("Driver ID:", json.driverId);
        } else {
            console.log("No trips found.");
        }
    } catch (error) {
        console.error("Test Error:", error);
    }
    process.exit();
}

test();
