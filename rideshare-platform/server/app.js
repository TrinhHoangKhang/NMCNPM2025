const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for now (Web + Mobile), restrict in production
        methods: ["GET", "POST"]
    }
});

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'];
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://192.168.')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(morgan('dev'));
app.use(express.json());

// Attach Socket.io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Database Connection
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));

app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.get('/', (req, res) => {
    res.json({
        message: 'Ride-Sharing API is Running',
        status: 'active',
        timestamp: new Date()
    });
});

// Socket.io Setup
const socketHandler = require('./sockets/index');
socketHandler(io);

// Error Handling Middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Export app for testing
module.exports = app;

// Only listen if not required by tests
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
