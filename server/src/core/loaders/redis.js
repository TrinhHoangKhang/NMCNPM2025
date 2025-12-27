import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => {
    // Suppress repeated logs if connection fails
});

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
        console.log(`Redis connected to ${REDIS_URL}`);
    } catch (err) {
        console.warn(`Redis connection failed (${REDIS_URL}). Presence tracking will fall back to in-memory for this instance.`);
    }
})();

export default redisClient;
