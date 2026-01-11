import redis from '../config/redisConfig.js';
import dotenv from 'dotenv';

dotenv.config();

class PresenceService {
    /**
     * key patterns:
     * - user_sockets:{userId} -> Set of socket IDs
     * - user_presence:{userId} -> String "online" (with TTL)
     */

    async addUserSocket(userId, socketId) {
        if (!userId || !socketId) return;
        try {
            await Promise.all([
                redis.sadd(`user_sockets:${userId}`, socketId),
                redis.set(`user_presence:${userId}`, "online", "EX", 60)
            ]);
            // console.debug(`PresenceService: Added ${socketId} for ${userId}`);
        } catch (err) {
            console.error(`PresenceService Add Error: ${err.message}`);
        }
    }

    async removeUserSocket(userId, socketId) {
        if (!userId || !socketId) return;
        try {
            await redis.srem(`user_sockets:${userId}`, socketId);
            const count = await redis.scard(`user_sockets:${userId}`);

            if (count === 0) {
                await redis.del(`user_presence:${userId}`);
                // console.debug(`PresenceService: User ${userId} went offline`);
                return { isOffline: true };
            }
            return { isOffline: false, remaining: count };
        } catch (err) {
            console.error(`PresenceService Remove Error: ${err.message}`);
        }
    }

    async refreshHeartbeat(userId) {
        if (!userId) return;
        try {
            await redis.set(`user_presence:${userId}`, "online", "EX", 60);
        } catch (err) {
            console.error(`PresenceService Heartbeat Error: ${err.message}`);
        }
    }

    async getUserSocketIds(userId) {
        if (!userId) return [];
        try {
            return await redis.smembers(`user_sockets:${userId}`);
        } catch (err) {
            console.error(`PresenceService GetSockets Error: ${err.message}`);
            return [];
        }
    }

    // Optional: Get all online users (expensive scan) or just check one
    async isUserOnline(userId) {
        const status = await redis.get(`user_presence:${userId}`);
        return status === 'online';
    }
}

export default new PresenceService();
