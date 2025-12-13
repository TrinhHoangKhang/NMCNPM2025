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

const corsOptions = require('./config/cors');

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions)); // Enable pre-flight for all routes
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
