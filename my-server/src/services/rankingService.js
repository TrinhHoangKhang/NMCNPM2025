import redis from '../config/redisConfig.js';
import dotenv from 'dotenv';

dotenv.config();

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

    /**
     * Get the rank and score of a specific user/driver.
     * @param {string} userId 
     * @returns {Promise<{rank: number, score: number} | null>}
     */
    async getUserRank(userId) {
        try {
            // ZREVRANK returns 0-based index (0 is 1st place)
            const rank = await redis.zrevrank(this.LEADERBOARD_KEY, userId);
            const score = await redis.zscore(this.LEADERBOARD_KEY, userId);

            if (rank === null || score === null) {
                return null;
            }

            return {
                rank: rank + 1, // Convert to 1-based rank
                score: parseInt(score, 10)
            };
        } catch (err) {
            console.error("RankingService GetUserRank Error:", err.message);
            return null;
        }
    }

    /**
     * Update (Set) the user's score directly.
     * @param {string} userId 
     * @param {number} score 
     */
    async updateUserScore(userId, score) {
        try {
            await redis.zadd(this.LEADERBOARD_KEY, score, userId);
        } catch (err) {
            console.error("RankingService UpdateUserScore Error:", err.message);
        }
    }
}

export default new RankingService();
