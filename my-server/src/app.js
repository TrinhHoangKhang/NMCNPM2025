import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

// Initialize Firebase (and db/admin exports)
import './config/firebaseConfig.js';

// Initialize Passport Config
import passportConfig from './config/passportConfig.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import rankingRoutes from './routes/rankingRoutes.js';
import friendRoutes from './routes/friendRoutes.js';

import paymentRoutes from './routes/paymentRoutes.js';
// ==========================================
// 1. CONFIGURATION & SETUP
// ==========================================

// Load environment variables from .env file
dotenv.config();

// Pass passport instance to config function
passportConfig(passport);

const app = express();

// ==========================================
// 2. GLOBAL MIDDLEWARE
// ==========================================

// Security & Logging
app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting (Relaxed for Dev)
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, 
//     max: 100, 
// });
// app.use(limiter);

// CORS: Open for development
app.use(cors({ origin: '*' }));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport Middleware (stateless; no express-session)
app.use(passport.initialize());

// ==========================================
// 3. ROUTE DEFINITIONS
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ranks', rankingRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('RideApp Server is Running!');
});

// ==========================================
// 4. ERROR HANDLING
// ==========================================

app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;