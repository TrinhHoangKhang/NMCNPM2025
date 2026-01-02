import http from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import app from './src/app.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { admin } from './src/config/firebaseConfig.js';
import jwt from 'jsonwebtoken';
import driverService from './src/services/driverService.js';
import presenceService from './src/services/presenceService.js';

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

// Initialize Redis Client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

// Online Users: Managed via Redis (Sets)
// const onlineUsers = new Map(); // Deprecated
// app.set('onlineUsers', onlineUsers); // Deprecated

// Helper to verify token
const verifySocketToken = async (token) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            console.warn("DEV MODE: Decoding socket token without verification...");
            const decoded = jwt.decode(token);
            if (decoded) {
                // Firebase tokens use 'sub' or 'user_id', map it to 'uid' for consistency
                if (!decoded.uid) {
                    decoded.uid = decoded.sub || decoded.user_id;
                }
                if (decoded.uid) return decoded;
            }
        }
        console.error("Token verification failed:", error.message);
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

        // Use PresenceService to track user
        presenceService.addUserSocket(socket.user.uid, socket.id);

        // NEW: Auto-join 'drivers' room for broadcasting job requests
        if (socket.user.role === 'DRIVER') {
            if (socket.user.role === 'DRIVER') {
                socket.join('drivers');
                console.log(`Driver ${socket.user.email} joined 'drivers' room`);
            }
        }

        // Heartbeat for Presence (Debounced)
        let lastHeartbeat = 0;
        socket.on('heartbeat', async () => {
            if (!socket.user) return;
            const now = Date.now();
            // Debounce: update max once every 25 seconds
            if (now - lastHeartbeat < 25000) return;

            lastHeartbeat = now;
            try {
                await redis.set(`user_presence:${socket.user.uid}`, "online", "EX", 60);
                // console.log(`Heartbeat received from ${socket.user.email}`); 
            } catch (err) {
                console.error("Redis Heartbeat Error:", err.message);
            }
        });




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
            // console.log('Client disconnected:', socket.id);
            if (socket.user) {
                const userId = socket.user.uid;

                try {
                    // 1. Remove this specific socket from the user's set
                    await redis.srem(`user_sockets:${userId}`, socket.id);

                    // 2. Check how many sockets stick around
                    const count = await redis.scard(`user_sockets:${userId}`);

                    // 3. If no sockets left, remove presence IMMEDIATELY
                    if (count === 0) {
                        await redis.del(`user_presence:${userId}`);
                        console.log(`User Offline (Last socket gone): ${socket.user.email}`);

                        // NEW: Automatically mark driver as OFFLINE in DB
                        if (socket.user.role === 'DRIVER') {
                            // await driverService.updateStatus(socket.user.uid, 'OFFLINE');
                            console.log(`Driver ${socket.user.email} disconnected. Status cleanup.`);
                        }
                    } else {
                        console.log(`User Socket Disconnect: ${socket.user.email} (Remaining sockets: ${count})`);
                    }

                } catch (err) {
                    console.error("Redis Disconnect Error:", err);
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
