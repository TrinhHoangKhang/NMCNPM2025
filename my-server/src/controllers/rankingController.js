import rankingService from '../services/rankingService.js';
import driverService from '../services/driverService.js';
import { db } from '../config/firebaseConfig.js';

class RankingController {

    // GET /api/ranks
    async getLeaderboard(req, res) {
        try {
            // 1. Get Sorted IDs and Scores from Redis
            const topDrivers = await rankingService.getTopDrivers(10);

            // 2. Enrich with Driver Details from DB (Name, Avatar, etc.)
            const enrichedLeaderboard = await Promise.all(topDrivers.map(async (entry) => {
                try {
                    const driver = await driverService.getDriver(entry.driverId);
                    return {
                        id: entry.driverId,
                        name: driver.name || "Unknown Driver",
                        score: entry.score,
                        avatar: driver.avatarUrl || null, // Assuming avatarUrl exists or null
                        rating: driver.rating
                    };
                } catch (e) {
                    // Driver might be deleted
                    return {
                        id: entry.driverId,
                        name: "Unknown",
                        score: entry.score,
                        rating: 0
                    };
                }
            }));

            // Filter out any failed lookups if critical, or keep them
            res.status(200).json({ success: true, data: enrichedLeaderboard });

        } catch (error) {
            console.error("Leaderboard Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET /api/ranks/ranking
    async getRanking(req, res) {
        try {
            // 1. Top 5 Active Users (by tripCount)
            const usersSnapshot = await db.collection('users')
                .where('role', 'in', ['RIDER', 'rider'])
                .orderBy('tripCount', 'desc')
                .limit(5)
                .get();

            const topUsers = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // 2. Top 5 Ranked Drivers (by rating)
            const driversSnapshot = await db.collection('drivers')
                .orderBy('rating', 'desc')
                .limit(5)
                .get();

            const topDrivers = driversSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            res.status(200).json({
                success: true,
                data: {
                    activeUsers: topUsers,
                    topDrivers: topDrivers
                }
            });
        } catch (error) {
            console.error("Ranking Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }


    // POST /api/ranks/update
    async updateScore(req, res) {
        try {
            const { userId, score, points } = req.body;
            if (!userId) {
                return res.status(400).json({ success: false, error: "userId is required" });
            }

            if (score !== undefined) {
                await rankingService.updateUserScore(userId, score);
            } else if (points !== undefined) {
                await rankingService.updateScore(userId, points);
            } else {
                return res.status(400).json({ success: false, error: "Provide 'score' (set) or 'points' (add)" });
            }

            // Return new rank
            const rankData = await rankingService.getUserRank(userId);
            res.status(200).json({ success: true, data: { userId, ...rankData } });

        } catch (error) {
            console.error("Ranking Update Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET /api/ranks/:userId
    async getUserRank(req, res) {
        try {
            const { userId } = req.params;
            const rankData = await rankingService.getUserRank(userId);

            if (!rankData) {
                return res.status(404).json({ success: false, error: "User not found in ranking" });
            }

            // Optionally fetch user details if needed by valid DB check
            // For now, return pure rank data from Redis
            res.status(200).json({ success: true, data: { userId, ...rankData } });

        } catch (error) {
            console.error("Get Rank Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default new RankingController();
