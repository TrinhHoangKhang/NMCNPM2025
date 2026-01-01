
import { db } from './src/config/firebaseConfig.js';
import admin from 'firebase-admin';

async function checkDriverRole() {
    try {
        const snapshot = await db.collection('users').where('email', '==', 'driver@example.com').get();

        if (snapshot.empty) {
            console.log('Driver not found');
            return;
        }

        let uid = '';
        snapshot.forEach(doc => {
            console.log('User:', doc.id, '=>', doc.data());
            uid = doc.id;
        });

        if (uid) {
            console.log(`Checking trips for driverId: ${uid}`);
            const tripSnap = await db.collection('trips')
                .where('driverId', '==', uid)
                .where('status', 'in', ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'])
                .get();

            if (tripSnap.empty) {
                console.log("No active trips found for driver.");
            } else {
                tripSnap.forEach(t => console.log("Found Trip:", t.id, t.data().status));
            }
        }

    } catch (err) {
        console.error(err);
    }
}

checkDriverRole();
