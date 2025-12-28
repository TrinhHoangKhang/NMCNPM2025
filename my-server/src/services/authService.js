import { admin, db } from '../config/firebaseConfig.js';

const registerUser = async (userData) => {
    const { idToken, name, phone, role } = userData;

    // STEP 1: Verify the Firebase ID Token
    // This proves the user is who they claim to be (and they are logged in on the client)
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    // STEP 2: Prepare data for Firestore Database
    const userDoc = {
        uid: uid,
        email: email,
        name: name || decodedToken.name || 'Unknown',
        phone: phone || "",
        role: role || "RIDER", // Default to Rider if not specified
        createdAt: new Date().toISOString(),
        isVerified: false
    };

    // STEP 3: Save to Firestore 'users' collection
    // We use .set() with { merge: true } so we don't overwrite if it exists (or we do, depending on requirement. Register usually initiates fields)
    // Using set without merge to ensure clean state on 'register', or merge checks?
    // Let's use set with merge: true to be safe against partial updates, but usually register implies new.
    await db.collection('users').doc(uid).set(userDoc, { merge: true });

    return userDoc;
};

const loginUser = async (idToken) => {
    // STEP 1: Verify the Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // STEP 2: Fetch extra details from YOUR Firestore Database
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
        // Option: Auto-create user if they exist in Auth but not DB?
        // For now, let's return basic auth info or throw.
        // If the client calls 'login' but hasn't 'registered' in our DB, they might need to call register.
        // However, some flows allow lazy creation.
        // Let's throw for now to enforce registration flow.
        throw new Error("User found in Auth but not in Database. Please register first.");
    }

    return userDoc.data();
};

export default { registerUser, loginUser };