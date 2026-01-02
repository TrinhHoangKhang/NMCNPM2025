import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Re-use or create new connection. For simplicity, new connection.
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
    console.error('RankingService Redis Error:', err.message);
});

class RankingService {
    constructor() {
        this.LEADERBOARD_KEY = 'driver_leaderboard';
    }

    /**
     * Increment the driver's score (trip count) in the leaderboard.
     * @param {string} driverId 
     * @param {number} points - Usually 1 for a completed trip
     */
    async updateScore(driverId, points = 1) {
        if (!driverId) return;
        try {
            await redis.zincrby(this.LEADERBOARD_KEY, points, driverId);
            // console.log(`RankingService: Incremented score for ${driverId} by ${points}`);
        } catch (err) {
            console.error("RankingService Update Error:", err.message);
        }
    }

    /**
     * Get the top N drivers from the leaderboard.
     * @param {number} limit 
     * @returns {Promise<Array<{driverId: string, score: number}>>}
     */
    async getTopDrivers(limit = 10) {
        try {
            // ZREVRANGE key 0 limit-1 WITHSCORES
            // Returns array like [driverId1, score1, driverId2, score2, ...]
            const result = await redis.zrevrange(this.LEADERBOARD_KEY, 0, limit - 1, 'WITHSCORES');

            const leaderboard = [];
            for (let i = 0; i < result.length; i += 2) {
                leaderboard.push({
                    driverId: result[i],
                    score: parseInt(result[i + 1], 10)
                });
            }
            return leaderboard;
        } catch (err) {
            console.error("RankingService GetTop Error:", err.message);
            return [];
        }
    }
}

export default new RankingService();
