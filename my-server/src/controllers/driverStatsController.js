import tripService from '../services/tripService.js';
import { db } from '../config/firebaseConfig.js';

class DriverStatsController {

    // GET /api/drivers/stats
    async getDriverStats(req, res) {
        try {
            const driverId = req.user.uid;

            // 1. Get History (Reusing existing service method)
            const trips = await tripService.getDriverTripHistory(driverId);

            // 2. Calculate Stats
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            let totalDurationSec = 0;
            let weeklyTripsCount = 0;
            let totalEarnings = 0;

            trips.forEach(t => {
                // Determine completion time
                const timeRef = t.completedAt ? new Date(t.completedAt) : (t.createdAt ? new Date(t.createdAt) : null);

                // Only count stats for COMPLETED trips (mostly)
                if (t.status === 'COMPLETED') {
                    if (t.duration) totalDurationSec += t.duration;
                    if (t.fare) totalEarnings += parseFloat(t.fare);

                    if (timeRef && timeRef > oneWeekAgo) {
                        weeklyTripsCount++;
                    }
                }
            });

            const hours = (totalDurationSec / 3600).toFixed(1);
            const totalCount = trips.filter(t => t.status === 'COMPLETED').length; // Only completed trips count for rank

            // Ranking Logic
            let currentRank = 'Bronze';
            let nextRank = 'Silver';
            let progress = 0;
            let pointsNeeded = 50;

            if (totalCount >= 100) {
                currentRank = 'Gold';
                nextRank = 'Platinum';
                progress = 100;
                pointsNeeded = 0;
            } else if (totalCount >= 50) {
                currentRank = 'Silver';
                nextRank = 'Gold';
                progress = ((totalCount - 50) / 50) * 100;
                pointsNeeded = 100 - totalCount;
            } else {
                // Bronze
                progress = (totalCount / 50) * 100;
                pointsNeeded = 50 - totalCount;
            }

            const statsPayload = {
                totalTrips: totalCount,
                hoursActive: hours,
                weeklyTrips: weeklyTripsCount,
                totalEarnings,
                rank: currentRank,
                progress: Math.round(progress),
                nextRank,
                pointsNeeded,
                acceptRate: 98 // Hardcoded as we don't track rejections yet
            };

            // PERSIST TO FIREBASE
            try {
                // Save to 'users' collection (Primary source of truth for profiles)
                await db.collection('users').doc(driverId).set({
                    stats: statsPayload,
                    rank: currentRank,
                    totalTrips: totalCount
                }, { merge: true });

                // Try saving to 'drivers' collection too if it exists separately
                const driverRef = db.collection('drivers').doc(driverId);
                const driverDoc = await driverRef.get();
                if (driverDoc.exists) {
                    await driverRef.update({
                        stats: statsPayload,
                        rank: currentRank,
                        totalTrips: totalCount
                    });
                }
            } catch (dbError) {
                console.error("Failed to persist stats to DB:", dbError);
                // Non-blocking error
            }

            res.status(200).json(statsPayload);

        } catch (error) {
            console.error("Stats Error:", error);
            res.status(500).json({ error: error.message });
        }
    }
}
export default new DriverStatsController();
