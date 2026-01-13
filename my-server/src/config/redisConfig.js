import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';

let redis;

// Check if Redis is available
const useRedisMock = process.env.USE_REDIS_MOCK === 'true' || process.env.NODE_ENV === 'integration';

if (useRedisMock) {
    redis = new RedisMock();
    console.log('Using mock Redis');
} else {
    // Connect to real Redis (WSL2 Ubuntu)
    redis = new Redis({
        host: 'localhost',
        port: 6379,
        retryStrategy: (times) => {
            if (times > 5) {
                console.warn('Redis connection failed after 5 attempts. Switching to mock Redis.');
                return null;
            }
            return Math.min(times * 50, 2000);
        }
    });

    redis.on('connect', () => {
        console.log('✓ Redis connected successfully');
    });

    redis.on('error', (err) => {
        console.warn('Redis error:', err.message);
    });
}

export default redis;
