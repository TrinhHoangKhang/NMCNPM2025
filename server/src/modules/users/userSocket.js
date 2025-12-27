import userRepository from './userRepository.js';
import redisClient from '../../core/loaders/redis.js';

const PRESENCE_PREFIX = 'presence:';
const PRESENCE_TTL = 300;
const fallbackPresence = new Map();

export const handleUserSocket = (socket, io) => {
    const user = socket.user;
    const userId = user.uid;
    const { role } = socket.handshake.query;

    const setPresence = async () => {
        const presenceData = {
            userId,
            email: user.email,
            role: role || 'USER',
            socketId: socket.id,
            connectedAt: new Date()
        };

        try {
            const redisUpdate = redisClient.isOpen
                ? redisClient.set(`${PRESENCE_PREFIX}${userId}`, JSON.stringify(presenceData), { EX: PRESENCE_TTL })
                : Promise.resolve();

            const firestoreUpdate = userRepository.setOnlineStatus(userId, true);

            if (!redisClient.isOpen) {
                fallbackPresence.set(userId, { ...presenceData, lastSeen: new Date() });
            }

            await Promise.all([redisUpdate, firestoreUpdate]);
        } catch (err) {
            console.error('Error setting presence:', err.message);
        }
    };

    // Initial setup
    setPresence();

    socket.on('heartbeat', () => {
        setPresence();
    });

    socket.on('disconnect', async () => {
        console.log(`User disconnected: ${user.email}`);
        try {
            const redisCleanup = redisClient.isOpen
                ? redisClient.del(`${PRESENCE_PREFIX}${userId}`)
                : Promise.resolve();

            const firestoreCleanup = userRepository.setOnlineStatus(userId, false);

            if (!redisClient.isOpen) {
                fallbackPresence.delete(userId);
            }

            await Promise.all([redisCleanup, firestoreCleanup]);
        } catch (err) {
            console.error('Error removing presence:', err.message);
        }
    });
};
