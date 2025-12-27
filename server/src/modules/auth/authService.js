import { admin, db } from '../../core/loaders/firebaseLoader.js';
import axios from 'axios';

export const registerUserSync = async (userData) => {
    const { idToken, name, phone, role } = userData;

    // STEP 1: Verify the ID Token from the client
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // STEP 2: Prepare data for Firestore Database
    const userDoc = {
        uid: uid,
        email: email,
        name: name,
        phone: phone || "",
        role: role || "RIDER",
        createdAt: new Date().toISOString(),
        isVerified: false
    };

    // STEP 3: Save to Firestore 'users' collection
    await db.collection('users').doc(uid).set(userDoc);

    return userDoc;
};

export const verifyAndFetchProfile = async (idToken) => {
    // STEP 1: Verify the ID Token from the client
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // STEP 2: Fetch profile from Firestore
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
        throw new Error("USER_NOT_FOUND");
    }

    return userDoc.data();
};

/**
 * Traditional Email/Password Registration
 */
export const registerUserTraditional = async (userData) => {
    const { email, password, name, phone, role } = userData;

    // STEP 1: Create User in Firebase Authentication
    const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name
    });

    const uid = userRecord.uid;

    // STEP 2: Prepare data for Firestore
    const userDoc = {
        uid: uid,
        email: email,
        name: name,
        phone: phone || "",
        role: role || "RIDER",
        createdAt: new Date().toISOString(),
        isVerified: false
    };

    // STEP 3: Save to Firestore
    await db.collection('users').doc(uid).set(userDoc);

    return userDoc;
};

/**
 * Traditional Email/Password Login via Firebase REST API
 */
export const loginUserTraditional = async (email, password) => {
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) {
        throw new Error("FIREBASE_WEB_API_KEY is not configured on server");
    }

    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    try {
        const response = await axios.post(verifyUrl, {
            email: email,
            password: password,
            returnSecureToken: true
        });

        const uid = response.data.localId;
        const idToken = response.data.idToken;

        // Fetch extra details from Firestore
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            throw new Error("USER_NOT_FOUND");
        }

        return {
            ...userDoc.data(),
            idToken // Return the token for the client to use
        };

    } catch (error) {
        console.error("Firebase Auth Error:", error.response?.data?.error?.message || error.message);
        throw new Error("INVALID_LOGIN");
    }
};