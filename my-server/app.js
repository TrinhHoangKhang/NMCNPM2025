const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

// ==========================================
// 1. CONFIGURATION & SETUP
// ==========================================

// Load environment variables from .env file
dotenv.config();

// Initialize Firebase (Database)
// We don't need to save this to a variable here, just running the file is enough
require('./src/config/firebaseConfig');

// Initialize Passport (Authentication Strategies)
// We pass the 'passport' library instance to our config file to set it up
require('./src/config/passportConfig')(passport);

const app = express();

// ==========================================
// 2. GLOBAL MIDDLEWARE
// ==========================================

// CORS: Allows your Mobile App (or a website on a different domain) to talk to this server
app.use(cors());

// Body Parsers: Read data sent from the client
app.use(express.json()); // Reads JSON ({"message": "hi"}) -> Crucial for Mobile
app.use(express.urlencoded({ extended: true })); // Reads Form Data (name=john) -> For OAuth callbacks

// Session Support
// Passport needs this to temporarily store the user state during the Google login process
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// ==========================================
// 3. ROUTE IMPORTING
// ==========================================

const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const mapRoutes = require('./src/routes/mapRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const tripRoutes = require('./src/routes/tripRoutes');
const userRoutes = require('./src/routes/userRoutes');

// ==========================================
// 4. ROUTE DEFINITIONS
// ==========================================

// A. Auth Routes (Google Login)
// Endpoints: /auth/google, /auth/google/callback
app.use('/auth', authRoutes);

// B. Chatbot Routes (OpenAI)
// Endpoints: POST /api/chat/send
app.use('/api/chat', chatRoutes);

// C. Map Routes (Google Maps)
// Endpoints: POST /api/maps/calculate
app.use('/api/maps', mapRoutes);

// D. Driver Routes
// Endpoints: GET /api/drivers/:id, PATCH /api/drivers/:id, etc.
app.use('/api/drivers', driverRoutes);

// E. Trip Routes
// Endpoints: POST /api/trips/request, PATCH /api/trips/:id/accept
app.use('/api/trips', tripRoutes);

// F. User Routes
// Endpoints: GET /api/users/:id
app.use('/api/users', userRoutes);

// D. Health Check (Optional)
// Good for testing if your server is alive without complex logic
app.get('/', (req, res) => {
    res.send('RideApp Server is Running!');
});

// ==========================================
// 5. ERROR HANDLING
// ==========================================

// If a Route or Service throws an error, it ends up here
app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
});

// ==========================================
// 6. SERVER START
// ==========================================

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
    });
}

module.exports = app;