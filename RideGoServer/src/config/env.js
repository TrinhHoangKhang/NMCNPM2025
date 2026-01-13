import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
    'PORT',
    // Add other critical env vars here like DB config if needed
];

export const checkEnv = () => {
    const missing = requiredEnvVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

export const config = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FIREBASE_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Example
    SESSION_SECRET: process.env.SESSION_SECRET || 'CHANGE_THIS_SECRET_IN_PROD',
};
