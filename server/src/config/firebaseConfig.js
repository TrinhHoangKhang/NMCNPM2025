import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let adminInstance;
let dbInstance;

const hasFirebaseCredentials =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (process.env.NODE_ENV !== 'test' && hasFirebaseCredentials) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // THE FIX: Replaces \\n with real line breaks
        privateKey: (typeof process.env.FIREBASE_PRIVATE_KEY === 'string')
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      })
    });
    adminInstance = admin;
    dbInstance = admin.firestore();
    console.log('Firebase initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error.message);
  }
}

if (!adminInstance) {
  console.warn('WARNING: Firebase is not properly configured. Using mock data.');
  // Mock for development/missing config to prevent crash
  adminInstance = {
    auth: () => ({
      verifyIdToken: async () => ({ uid: 'mock-user-id', email: 'mock@example.com', role: 'RIDER' }),
      getUserByEmail: async () => { throw { code: 'auth/user-not-found' }; },
      createUser: async (data) => ({ uid: 'mock-user-id', ...data }),
      getUser: async (uid) => ({ uid, email: 'mock@example.com', displayName: 'Mock User' }),
      deleteUser: async () => { }
    })
  };
  dbInstance = {
    collection: (collName) => ({
      doc: (docId) => ({
        get: async () => ({
          exists: true,
          data: () => ({
            uid: docId || 'mock-user-id',
            email: 'mock@example.com',
            name: 'Mock User',
            role: collName === 'drivers' ? 'DRIVER' : 'RIDER',
            createdAt: new Date().toISOString()
          })
        }),
        set: async () => { },
        update: async () => { },
        onSnapshot: (callback) => {
          // Trigger callback immediately for some consistency
          return () => { };
        }
      }),
      add: async (data) => ({ id: 'mock-id', ...data }),
      where: function () { return this; },
      limit: function () { return this; },
      get: async () => ({ docs: [] })
    }),
    batch: () => ({
      update: () => { },
      commit: async () => { }
    })
  };
}

export { adminInstance as admin, dbInstance as db };