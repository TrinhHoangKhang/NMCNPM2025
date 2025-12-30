import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { admin } from './src/config/firebaseConfig.js';
import jwt from 'jsonwebtoken';
import driverService from './src/services/driverService.js';

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
export const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev
        methods: ["GET", "POST"]
    }
});

// Online Users Map: userId -> socketId
const onlineUsers = new Map();
app.set('onlineUsers', onlineUsers);

// Helper to verify token
const verifySocketToken = async (token) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.warn("DEV MODE: Decoding socket token without verification...");
            const decoded = jwt.decode(token);
            if (decoded && decoded.uid) return decoded;
        }
        throw error;
    }
};

// Socket.io Middleware for Authentication
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        const decoded = await verifySocketToken(token);
        socket.user = decoded; // Attach user data to socket
        next();
    } catch (err) {
        console.error("Socket Auth Error:", err.message);
        next(new Error("Authentication error"));
    }
});

// Socket.io Events
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    if (socket.user) {
        console.log(`User Online: ${socket.user.email} (${socket.user.uid})`);
        onlineUsers.set(socket.user.uid, socket.id);

        // NEW: Auto-join 'drivers' room for broadcasting job requests
        if (socket.user.role === 'DRIVER') {
            socket.join('drivers');
            console.log(`Driver ${socket.user.email} joined 'drivers' room`);
        }

        // Optional: Broadcast online status or count
        // io.emit('online_users_update', onlineUsers.size);
    }



    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on('update_location', (data) => {
        // data: { tripId, lat, lng, heading }
        if (socket.user && socket.user.role === 'DRIVER' && data.tripId) {
            // Broadcast location to the trip room (Rider is in here)
            const roomName = `trip_${data.tripId}`;
            io.to(roomName).emit('driver_location', {
                driverId: socket.user.uid,
                lat: data.lat,
                lng: data.lng,
                heading: data.heading
            });
        }
    });

    socket.on('disconnect', async () => {
        console.log('Client disconnected:', socket.id);
        if (socket.user) {
            onlineUsers.delete(socket.user.uid);
            console.log(`User Offline: ${socket.user.email}`);

            // NEW: Automatically mark driver as OFFLINE in DB
            if (socket.user.role === 'DRIVER') {
                try {
                    await driverService.updateStatus(socket.user.uid, 'OFFLINE');
                    console.log(`Driver ${socket.user.email} marked OFFLINE in DB.`);
                } catch (err) {
                    console.error(`Failed to mark driver offline: ${err.message}`);
                }
            }
        }
    });
});

// Make io accessible in routes (optional, or export it)
app.set('socketio', io);

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
