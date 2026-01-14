import { db } from './src/config/firebaseConfig.js';

const RIDER_ID = 'Az3xkptlvUZGI8nefIMb1EWfE1Q2';

async function checkOrphans() {
    console.log(`Checking trips for Rider ID: ${RIDER_ID}...`);

    try {
        const snapshot = await db.collection('trips')
            .where('riderId', '==', RIDER_ID)
            .get();

        if (snapshot.empty) {
            console.log("No trips found for this rider.");
        } else {
            let activeCount = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`Found Trip [${doc.id}]: Status=${data.status}`);
                if (['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(data.status)) {
                    activeCount++;
                    console.log(`>>> ACTIVE TRIP CAUSING BLOCK BLOCK <<<`);
                }
            });
            console.log(`Total trips: ${snapshot.size}, Active trips: ${activeCount}`);

            // Check User Doc
            const userDoc = await db.collection('users').doc(RIDER_ID).get();
            console.log(`User Document Exists? ${userDoc.exists}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }

    console.log("Done.");
    process.exit(0);
}

checkOrphans();
