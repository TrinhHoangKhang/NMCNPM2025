import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import admin from '../config/firebaseAdmin.js';
import redisClient from '../config/redis.js';
import { db } from '../config/firebaseConfig.js';

let io;
const PRESENCE_PREFIX = 'presence:';
const PRESENCE_TTL = 300; // 5 minutes
const fallbackPresence = new Map();

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Setup Redis Adapter for horizontal scaling
    const setupRedis = async () => {
        try {
            const pubClient = redisClient.duplicate();
            const subClient = redisClient.duplicate();

            await Promise.all([pubClient.connect(), subClient.connect()]);
            io.adapter(createAdapter(pubClient, subClient));
            console.log('Socket.io Redis adapter initialized');
        } catch (err) {
            console.warn('Socket.io Redis adapter setup failed. Using local adapter.');
        }
    };

    setupRedis();

    // Middleware to verify Firebase Token
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            socket.user = decodedToken;
            next();
        } catch (error) {
            console.error('Socket auth failed:', error.message);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        const user = socket.user;
        const userId = user.uid;
        const { role } = socket.handshake.query;

        console.log(`User connected: ${user.email} (${userId})`);

        // Store presence in Redis with TTL or fallback to Map
        const presenceData = {
            userId,
            email: user.email,
            role: role || 'USER',
            socketId: socket.id,
            connectedAt: new Date()
        };

        const setPresence = async () => {
            try {
                // Perform Parallel Updates (Redis for real-time, Firestore for persistence)
                const redisUpdate = redisClient.isOpen
                    ? redisClient.set(`${PRESENCE_PREFIX}${userId}`, JSON.stringify(presenceData), { EX: PRESENCE_TTL })
                    : Promise.resolve();

                const firestoreUpdate = db.collection('users').doc(userId).update({
                    is_online: true
                }).catch(err => console.error('Firestore Presence Error (Connect):', err.message));

                if (!redisClient.isOpen) {
                    fallbackPresence.set(userId, { ...presenceData, lastSeen: new Date() });
                }

                await Promise.all([redisUpdate, firestoreUpdate]);
            } catch (err) {
                console.error('Error setting presence:', err.message);
            }
        };

        await setPresence();

        socket.on('heartbeat', async () => {
            await setPresence();
        });

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${user.email}`);
            try {
                const redisCleanup = redisClient.isOpen
                    ? redisClient.del(`${PRESENCE_PREFIX}${userId}`)
                    : Promise.resolve();

                const firestoreCleanup = db.collection('users').doc(userId).update({
                    is_online: false,
                    last_seen_at: admin.firestore.FieldValue.serverTimestamp()
                }).catch(err => console.error('Firestore Presence Error (Disconnect):', err.message));

                if (!redisClient.isOpen) {
                    fallbackPresence.delete(userId);
                }

                await Promise.all([redisCleanup, firestoreCleanup]);
            } catch (err) {
                console.error('Error removing presence:', err.message);
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
