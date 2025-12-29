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

    return userDoc;
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