const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');

// ==========================================
// 1. CONFIGURATION & SETUP
// ==========================================

// Load environment variables from .env file
dotenv.config();

// Initialize Firebase (Database)
require('./config/firebaseConfig'); // Refactored path

// Initialize Passport (Authentication Strategies)
require('./config/passportConfig')(passport); // Refactored path

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
// 3. ROUTE IMPORTING
// ==========================================

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const mapRoutes = require('./routes/mapRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');

// ==========================================
// 4. ROUTE DEFINITIONS
// ==========================================

app.use('/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('RideApp Server is Running!');
});

// ==========================================
// 5. ERROR HANDLING
// ==========================================

app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;