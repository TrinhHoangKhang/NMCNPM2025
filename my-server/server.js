import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
export const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev
        methods: ["GET", "POST"]
    }
});

// Socket.io Events
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Check if auth token is present (if you implemented socket auth)
    if (socket.handshake.auth && socket.handshake.auth.token) {
        console.log("Socket authenticated with token");
    }

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on('update_location', (data) => {
        // Broadcast location to riders tracking this driver
        // io.to(data.tripId).emit('driver_location', data.location);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible in routes (optional, or export it)
app.set('socketio', io);

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
