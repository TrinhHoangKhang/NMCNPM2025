import { db } from './src/config/firebaseConfig.js';

const RIDER_ID = 'Az3xkptlvUZGI8nefIMb1EWfE1Q2';

async function cleanOrphans() {
    console.log(`Cleaning orphan trips for Rider ID: ${RIDER_ID}...`);

    try {
        const snapshot = await db.collection('trips')
            .where('riderId', '==', RIDER_ID)
            .where('status', 'in', ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'])
            .get();

        if (snapshot.empty) {
            console.log("No active orphan trips found.");
        } else {
            const batch = db.batch();
            snapshot.forEach(doc => {
                console.log(`Deleting stuck trip: ${doc.id} (Status: ${doc.data().status})`);
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Successfully deleted ${snapshot.size} stuck trips.`);
        }
    } catch (error) {
        console.error("Error:", error);
    }

    console.log("Cleanup Done.");
    process.exit(0);
}

cleanOrphans();
