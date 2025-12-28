import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { admin, db } from './firebaseConfig.js'; // Note the .js extension

export default function (passport) {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        console.log("Initializing Google OAuth Strategy...");
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
        },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const googleId = profile.id;
                    const displayName = profile.displayName;

                    // STEP 1: Check if user exists in Firebase Auth
                    let userRecord;
                    try {
                        // Try to find the user by email
                        userRecord = await admin.auth().getUserByEmail(email);
                    } catch (error) {
                        // If error code is 'user-not-found', we create them
                        if (error.code === 'auth/user-not-found') {
                            userRecord = await admin.auth().createUser({
                                email: email,
                                emailVerified: true,
                                displayName: displayName,
                                // We don't set a password because they use Google
                            });

                            // STEP 2: Create the User Document in Firestore (Database)
                            await db.collection('users').doc(userRecord.uid).set({
                                name: displayName,
                                email: email,
                                googleId: googleId, // Link Google ID to Firebase ID
                                role: "RIDER",      // Default role
                                createdAt: new Date()
                            });
                        } else {
                            throw error; // Real error (e.g., server down)
                        }
                    }

                    // STEP 3: Return the Firebase User to the Controller
                    // Now req.user will contain the Firebase data
                    return done(null, userRecord);

                } catch (err) {
                    return done(err, null);
                }
            }));
    } else {
        console.warn("Google Client ID/Secret not found. Google Auth disabled.");
    }

    // Serialize/Deserialize: Helps Passport remember the user in the session
    passport.serializeUser((user, done) => {
        done(null, user.uid); // Save only the UID in the session
    });

    passport.deserializeUser(async (uid, done) => {
        try {
            const user = await admin.auth().getUser(uid);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};