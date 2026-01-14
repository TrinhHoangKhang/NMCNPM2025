import redis from '../config/redisConfig.js';
import dotenv from 'dotenv';

dotenv.config();

class RankingService {
    constructor() {
        this.LEADERBOARD_KEY = 'driver_leaderboard';
    }

    /**
     * Helper to get key based on role
     */
    getKey(role = 'DRIVER') {
        return (role.toUpperCase() === 'RIDER') ? 'rider_leaderboard' : 'driver_leaderboard';
    }

    /**
     * Increment the user's score in the leaderboard.
     * @param {string} userId 
     * @param {number} points 
     * @param {string} role - 'DRIVER' or 'RIDER'
     */
    async updateScore(userId, points = 1, role = 'DRIVER') {
        if (!userId) return;
        try {
            const key = this.getKey(role);
            await redis.zincrby(key, points, userId);
        } catch (err) {
            console.error("RankingService Update Error:", err.message);
        }
    }

    /**
     * Get the top N users from the leaderboard.
     * @param {number} limit 
     * @param {string} role 
     * @returns {Promise<Array<{id: string, score: number}>>}
     */
    async getTopUsers(limit = 10, role = 'DRIVER') {
        try {
            const key = this.getKey(role);
            // ZREVRANGE key 0 limit-1 WITHSCORES
            const result = await redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');

            const leaderboard = [];
            for (let i = 0; i < result.length; i += 2) {
                leaderboard.push({
                    id: result[i],
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
     * Get the rank and score of a specific user.
     * @param {string} userId 
     * @param {string} role
     * @returns {Promise<{rank: number, score: number} | null>}
     */
    async getUserRank(userId, role = 'DRIVER') {
        try {
            const key = this.getKey(role);
            // ZREVRANK returns 0-based index
            const rank = await redis.zrevrank(key, userId);
            const score = await redis.zscore(key, userId);

            if (rank === null || score === null) {
                return null;
            }

            return {
                rank: rank + 1,
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
     * @param {string} role
     */
    async updateUserScore(userId, score, role = 'DRIVER') {
        try {
            const key = this.getKey(role);
            await redis.zadd(key, score, userId);
        } catch (err) {
            console.error("RankingService UpdateUserScore Error:", err.message);
        }
    }
}

export default new RankingService();
