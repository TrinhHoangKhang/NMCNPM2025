import { admin, db } from '../config/firebaseConfig.js';

export default async (req, res, next) => {
    try {
        // 1. Get the Authorization Header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        // 2. Verify Token
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (authError) {
            console.warn("Verify ID Token verification failed:", authError.message);
            // In DEVELOPMENT, allow expired/future tokens if we can decode them
            if (process.env.NODE_ENV === 'development') {
                console.warn("DEV MODE: Attempting to decode token without verification...");
                const jwt = await import('jsonwebtoken');
                // jwt.decode does NOT verify signature/expiration
                decodedToken = jwt.default.decode(token);

                if (!decodedToken || !decodedToken.uid) {
                    throw new Error("Could not decode token even without verification");
                }
                console.warn("DEV MODE: Used unverified token for UID:", decodedToken.uid);
            } else {
                throw authError;
            }
        }

        const uid = decodedToken.uid;
        // 3. Get User Role from Firestore
        const userDoc = await db.collection('users').doc(uid).get();
        let role = 'USER';

        if (userDoc.exists) {
            role = userDoc.data().role || 'USER';
        }

        // 4. Attach to Request
        req.user = {
            uid: uid,
            email: decodedToken.email,
            role: role
        };

        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ message: "Auth failed / Invalid Token" });
    }
};