const User = require('../models/User');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');

// @desc    Get System Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getSystemStats = async (req, res) => {
    try {
        // Parallelize queries for performance
        const [userCount, activeDrivers, tripStats] = await Promise.all([
            User.countDocuments({ role: { $in: ['rider', 'driver'] } }), // Count all non-admin users
            Driver.countDocuments({ isOnline: true }),
            Trip.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$fare" },
                        totalRides: { $sum: 1 }
                    }
                }
            ])
        ]);

        const stats = {
            totalUsers: userCount,
            activeDrivers: activeDrivers,
            totalRevenue: tripStats[0]?.totalRevenue || 0,
            totalRides: tripStats[0]?.totalRides || 0
        };

        res.json(stats);
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch system statistics" });
    }
};

module.exports = { getSystemStats };
