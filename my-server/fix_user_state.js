import { db } from './src/config/firebaseConfig.js';

const userId = 'Az3xkptlvUZGI8nefIMb1EWfE1Q2';

async function fixUserState() {
    console.log(`Checking user: ${userId}`);

    // Wait for DB to be potentially initialized if async (it seems sync in config but let's be safe)
    if (!db) {
        throw new Error("DB instance is undefined");
    }

    // 1. Check User Document
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        console.log('User document missing! Creating default user...');
        await userRef.set({
            name: "Test User",
            email: "test@example.com",
            phone: "0123456789",
            role: "RIDER",
            createdAt: new Date().toISOString()
        });
        console.log('User created.');
    } else {
        console.log('User exists.');
    }

    // 2. Check Active Trips
    console.log('Searching for active trips...');
    const tripQuery = db.collection('trips')
        .where('riderId', '==', userId)
        .where('status', 'in', ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS']);

    const snapshot = await tripQuery.get();
    if (snapshot.empty) {
        console.log('No active trips found.');
    } else {
        console.log(`Found ${snapshot.size} active trips. Cancelling them...`);
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            console.log(`- Cancelling trip ${doc.id} (Status: ${doc.data().status})`);
            batch.update(doc.ref, {
                status: 'CANCELLED',
                cancelledBy: 'ADMIN_SCRIPT',
                cancelledAt: new Date().toISOString()
            });
        });
        await batch.commit();
        console.log('All active trips cancelled.');
    }
}

fixUserState()
    .then(() => {
        console.log("Done.");
        process.exit(0);
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });
