import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Configurations
import './core/loaders/firebaseLoader.js';

// Routes
import apiRouter from './api/routes/index.js';

// Middleware
import { notFoundHandler, errorHandler } from './api/middlewares/errorMiddleware.js';

// Load environment variables from .env file
dotenv.config();

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
    max: 1000, // Increased for development testing
});
app.use(limiter);


// CORS: Allows your Mobile App to talk to this server
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 4. ROUTE DEFINITIONS
// ==========================================

app.use('/api', apiRouter);

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