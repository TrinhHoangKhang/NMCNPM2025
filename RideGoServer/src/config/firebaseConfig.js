import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let dbInstance;

if (process.env.NODE_ENV !== 'test') {
  // Check if app is already initialized to prevent hot-reload errors
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // THE FIX: Replaces \\n with real line breaks
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
      });
    } catch (err) {
      console.error("Firebase Initialization Failed:", err.message);
    }
  }

  if (admin.apps.length) {
    dbInstance = admin.firestore();
    dbInstance.settings({ ignoreUndefinedProperties: true });
  } else {
    console.warn("Firebase App not initialized. Creating mock DB that always throws.");
    dbInstance = {
      collection: () => ({
        doc: () => ({
          get: async () => { throw new Error("Database not initialized"); },
          set: async () => { throw new Error("Database not initialized"); },
          update: async () => { throw new Error("Database not initialized"); },
          delete: async () => { throw new Error("Database not initialized"); },
        }),
        where: () => ({
          get: async () => { throw new Error("Database not initialized"); },
          orderBy: () => ({
            get: async () => { throw new Error("Database not initialized"); },
            limit: () => ({ get: async () => { throw new Error("Database not initialized"); } })
          })
        }),
      })
    };
  }
} else {
  // Mock for testing to prevent crash
  dbInstance = { collection: () => ({ doc: () => ({ get: () => { }, update: () => { }, set: () => { } }) }) };
}

export { admin };
export const db = dbInstance;