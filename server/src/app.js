import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from 'passport';

// Configurations
import './config/firebaseConfig.js';
import configurePassport from './config/passportConfig.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import fareRoutes from './routes/fareRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import devRoutes from './routes/devRoutes.js';

// Middleware
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Passport (Authentication Strategies)
configurePassport(passport);

const app = express();

// ==========================================
// 2. GLOBAL MIDDLEWARE
// ==========================================

// Security & Logging
app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting (Basic Protection)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS: Allows your Mobile App to talk to this server
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Support
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// ==========================================
// 4. ROUTE DEFINITIONS
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/fares', fareRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/dev', devRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('RideApp Server is Running!');
});

// ==========================================
// 5. ERROR HANDLING
// ==========================================

// Handler for unknown API routes (404)
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;