import { admin, db } from '../config/firebaseConfig.js';
import axios from 'axios';

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

const registerUser = async (userData) => {
    const { email, password, name, phone, role } = userData;

    // STEP 1: Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
    });

    const uid = userRecord.uid;

    // STEP 2: Prepare data for Firestore Database
    const userDoc = {
        uid: uid,
        email: email,
        name: name || 'Unknown',
        phone: phone || "",
        role: role || "RIDER",
        createdAt: new Date().toISOString(),
        isVerified: false
    };

    // STEP 3: Save to Firestore
    await db.collection('users').doc(uid).set(userDoc, { merge: true });

    // STEP 3b: If Driver, create entry in 'drivers' collection
    if (role === 'DRIVER') {
        const driverDoc = {
            uid: uid,
            email: email,
            name: name || 'Unknown',
            phone: phone || "",
            role: 'DRIVER',
            vehicle: userData.vehicleType ? { type: userData.vehicleType, plate: userData.licensePlate || 'Unknown' } : null,
            status: 'OFFLINE',
            currentLocation: null,
            rating: 5.0,
            totalTrips: 0,
            walletBalance: 0,
            createdAt: new Date().toISOString()
        };
        await db.collection('drivers').doc(uid).set(driverDoc, { merge: true });
    }

    // STEP 4: Generate Custom Token (since we are admin) or Login
    // Note: Clients usually exchange custom tokens for ID tokens, but for simplicity in this REST API flow, 
    // we can use the same sign-in logic as loginUser to get a real ID token, OR just return a custom token.
    // However, our middleware verifies ID tokens. A custom token is different.
    // The best path for a REST API that acts as a proxy is to effectively "login" the user immediately.

    // We can reuse the logic from loginUser effectively
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
    try {
        const response = await axios.post(url, {
            email,
            password,
            returnSecureToken: true
        });
        const { idToken } = response.data;
        return { ...userDoc, token: idToken };
    } catch (e) {
        console.warn("Auto-login after register failed, user must login manually:", e.message);
        return userDoc;
    }
};

const loginUser = async (email, password) => {
    // STEP 1: Authenticate with Firebase using REST API (since logic moved to server)
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

    const response = await axios.post(url, {
        email,
        password,
        returnSecureToken: true
    });

    const { idToken, localId } = response.data;

    // STEP 2: Fetch details from Firestore
    const userDocRef = db.collection('users').doc(localId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
        throw new Error("User record not found in database.");
    }

    return {
        ...userDoc.data(),
        token: idToken
    };
};

export default { registerUser, loginUser };