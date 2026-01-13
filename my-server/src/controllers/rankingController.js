import rankingService from '../services/rankingService.js';
import driverService from '../services/driverService.js';
import { db } from '../config/firebaseConfig.js';

class RankingController {

    // GET /api/ranks?role=DRIVER|RIDER
    async getLeaderboard(req, res) {
        try {
            const role = req.query.role || 'DRIVER';
            // 1. Get Sorted IDs and Scores from Redis
            const topUsers = await rankingService.getTopUsers(10, role);

            // 2. Enrich with Details from DB
            const enrichedLeaderboard = await Promise.all(topUsers.map(async (entry) => {
                try {
                    let userDetails;
                    if (role.toUpperCase() === 'RIDER') {
                        // Dynamically import or use existing import if available
                        // Assuming userService is imported for Riders
                        const { default: userService } = await import('../services/userService.js');
                        userDetails = await userService.getUser(entry.id);
                    } else {
                        userDetails = await driverService.getDriver(entry.id);
                    }

                    return {
                        id: entry.id,
                        name: userDetails.name || "Unknown",
                        score: entry.score,
                        avatar: userDetails.avatarUrl || userDetails.avatar || null,
                        rating: userDetails.rating || 0
                    };
                } catch (e) {
                    return {
                        id: entry.id,
                        name: "Unknown",
                        score: entry.score,
                        rating: 0
                    };
                }
            }));

            res.status(200).json({ success: true, data: enrichedLeaderboard });

        } catch (error) {
            console.error("Leaderboard Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }


    // POST /api/ranks/update
    async updateScore(req, res) {
        try {
            const { userId, score, points, role } = req.body; // role optional, default DRIVER
            const targetRole = role || 'DRIVER';

            if (!userId) {
                return res.status(400).json({ success: false, error: "userId is required" });
            }

            if (score !== undefined) {
                await rankingService.updateUserScore(userId, score, targetRole);
            } else if (points !== undefined) {
                await rankingService.updateScore(userId, points, targetRole);
            } else {
                return res.status(400).json({ success: false, error: "Provide 'score' (set) or 'points' (add)" });
            }

            // Return new rank
            const rankData = await rankingService.getUserRank(userId, targetRole);
            res.status(200).json({ success: true, data: { userId, ...rankData } });

        } catch (error) {
            console.error("Ranking Update Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET /api/ranks/:userId?role=DRIVER
    async getUserRank(req, res) {
        try {
            const { userId } = req.params;
            const role = req.query.role || 'DRIVER';

            const rankData = await rankingService.getUserRank(userId, role);

            if (!rankData) {
                return res.status(404).json({ success: false, error: "User not found in ranking" });
            }

            res.status(200).json({ success: true, data: { userId, ...rankData } });

        } catch (error) {
            console.error("Get Rank Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default new RankingController();
