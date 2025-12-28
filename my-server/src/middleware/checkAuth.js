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
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;

        // 3. Get User Role from Firestore
        // (Because we store role in DB, not usually in custom assertions unless set explicitly)
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