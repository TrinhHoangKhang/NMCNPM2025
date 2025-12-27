import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import admin from '../../core/loaders/firebaseAdmin.js';
import redisClient from '../../core/loaders/redis.js';
import { handleUserSocket } from '../../modules/users/userSocket.js';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const setupRedis = async () => {
        // Only attempt adapter setup if Redis is intended to be used (i.e. REDIS_URL is provided)
        if (!process.env.REDIS_URL) {
            console.log('Socket.io: No REDIS_URL provided. Operating in single-node mode with local adapter.');
            return;
        }

        try {
            const pubClient = redisClient.duplicate();
            const subClient = redisClient.duplicate();

            await Promise.all([pubClient.connect(), subClient.connect()]);
            io.adapter(createAdapter(pubClient, subClient));
            console.log('Socket.io: Redis adapter initialized successfully.');
        } catch (err) {
            console.warn('Socket.io: Redis adapter setup failed (Redis may be offline). Falling back to local adapter.');
        }
    };

    setupRedis();

    // Middleware to verify Firebase Token
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error: Token missing'));

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            socket.user = decodedToken;
            next();
        } catch (error) {
            console.error('Socket auth failed:', error.message);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.email} (${socket.user.uid})`);

        // Delegate to domain handlers
        handleUserSocket(socket, io);
        // handleRideSocket(socket, io); // To be implemented
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
};
