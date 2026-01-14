import tripService from './src/services/tripService.js';
import { db } from './src/config/firebaseConfig.js';

console.log("Starting Verification...");

async function test() {
    try {
        const trips = await tripService.getAllTrips();
        console.log(`Total Trips: ${trips.length}`);

        trips.forEach((t, i) => {
            const json = t.toJSON();
            // Explicitly check instance prop vs json prop
            const rNameInstance = t.riderName;
            const rNameJSON = json.riderName;

            console.log(`[${i}] ID: ${t.id} | Status: ${t.status}`);
            console.log(`    RiderID: ${t.riderId} | Name(Instance): ${rNameInstance} | Name(JSON): ${rNameJSON}`);
        });

    } catch (error) {
        console.error("Error:", error);
    }

    console.log("Waiting 5s before exit...");
    setTimeout(() => {
        console.log("Exiting.");
        process.exit(0);
    }, 5000);
}

test();
