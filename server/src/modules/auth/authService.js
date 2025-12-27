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