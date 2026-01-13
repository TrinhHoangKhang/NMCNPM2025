import rankingService from '../services/rankingService.js';
import driverService from '../services/driverService.js';

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
}

export default new RankingController();
