const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

const db = { collection: () => ({ doc: () => ({ get: jest.fn(), set: jest.fn(), update: jest.fn() }) }) }; // Mock DB for non-firebase envs

if (process.env.NODE_ENV !== 'test') {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // THE FIX: Replaces \\n with real line breaks
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
  module.exports = { admin, db: admin.firestore() };
} else {
  // Mock for testing to prevent crash
  module.exports = {
    admin: { auth: () => ({ verifyIdToken: () => { } }) },
    db: { collection: () => ({ doc: () => ({ get: () => { }, update: () => { }, set: () => { } }) }) }
  };
}