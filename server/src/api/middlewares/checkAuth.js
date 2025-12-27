import { admin, db } from '../../core/loaders/firebaseLoader.js';

export default async (req, res, next) => {
    try {
        // 1. Get the Authorization Header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "No token provided" });
        }

        // 2. Extract the token
        const idToken = authHeader.split(" ")[1];

        // 3. Verify the Firebase ID Token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // 4. Fetch additional user data (like role) from Firestore
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(401).json({ message: "User not found in database" });
        }

        const userData = userDoc.data();

        // 5. Attach user data to the request
        req.user = {
            uid: uid,
            email: decodedToken.email,
            role: userData.role || 'RIDER'
        };

        next();

    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(401).json({ message: "Authentication failed", error: error.message });
    }
};