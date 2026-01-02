import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import dotenv from 'dotenv';

dotenv.config();

let redis;

// Use mock for integration tests or if explicitly requested
if (process.env.NODE_ENV === 'integration') {
    // console.debug('Initializing Redis Mock for Integration Testing');
    redis = new RedisMock();
} else {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    // Only attach error handler for real redis to avoid noisy logs during tests if mock emits differently
    redis.on('error', (err) => {
        // Suppress connection refused logs in test environment if they leak
        if (process.env.NODE_ENV !== 'test') {
            console.error('Redis connection error:', err.message);
        }
    });
}

export default redis;
