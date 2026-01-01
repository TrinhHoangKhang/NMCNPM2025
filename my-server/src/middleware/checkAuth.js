import { admin, db } from '../config/firebaseConfig.js';
import jwt from 'jsonwebtoken';

export default async (req, res, next) => {
    try {
        // 1. Get the Authorization Header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        // 2. Verify Token
        const token = authHeader.split(" ")[1];

        // SPECIAL CASE: Admin Bypass Token
        if (token === 'admin-bypass-token') {
            req.user = {
                uid: 'admin-env-user',
                email: process.env.ADMIN_EMAIL || 'admin@test.com',
                role: 'ADMIN'
            };
            return next();
        }

        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (authError) {
            console.warn("Verify ID Token verification failed:", authError.message);
            // In DEVELOPMENT, allow expired/future tokens if we can decode them
            // Check for development environment slightly loosely to catch 'dev' or 'development'
            const env = process.env.NODE_ENV || 'development';
            if (env === 'development' || env === 'dev') {
                console.warn("DEV MODE: Attempting to decode token without verification...");

                // DEBUG LOGS
                console.log(`[checkAuth] Token received: ${token.substring(0, 20)}...`);
                decodedToken = jwt.decode(token);
                console.log(`[checkAuth] Decoded payload:`, JSON.stringify(decodedToken));

                if (decodedToken) {
                    // Normalize UID (Firebase raw tokens typically use 'sub' or 'user_id')
                    decodedToken.uid = decodedToken.uid || decodedToken.user_id || decodedToken.sub;
                }

                if (!decodedToken || !decodedToken.uid) {
                    throw new Error("Could not decode token even without verification");
                }
                console.warn("DEV MODE: Used unverified token for UID:", decodedToken.uid);
            } else {
                throw authError; // Rethrow if not in dev mode
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
            name: decodedToken.name || (userDoc.exists ? userDoc.data().name : "User"),
            role: role
        };

        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ message: "Auth failed / Invalid Token" });
    }
};