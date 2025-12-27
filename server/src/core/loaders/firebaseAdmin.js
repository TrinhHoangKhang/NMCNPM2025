import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin
try {
    if (!admin.apps.length) {
        if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY !== '""' && !process.env.FIREBASE_PRIVATE_KEY.includes('MOCK')) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // Handle escaped newlines in private key
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                })
            });
            console.log('Firebase Admin initialized successfully.');
        } else {
            console.warn('Firebase Private Key missing or mock. Falling back to applicationDefault or unauthenticated mode.');
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }
    }
} catch (error) {
    console.error('Failed to initialize Firebase Admin:', error.message);
    console.warn('Server will continue without Firebase Admin functionality.');
}

export default admin;
