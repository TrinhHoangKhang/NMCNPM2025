const Driver = require('../models/Driver');

const startCronJobs = () => {
    // Run every minute
    setInterval(async () => {
        try {
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

            const result = await Driver.updateMany(
                {
                    isOnline: true,
                    lastActiveAt: { $lt: tenMinutesAgo }
                },
                {
                    $set: { isOnline: false }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[Cron] Auto-offlined ${result.modifiedCount} drivers due to inactivity.`);
            }
        } catch (error) {
            console.error('[Cron] Error running auto-offline job:', error);
        }
    }, 60 * 1000); // 1 minute
};

module.exports = { startCronJobs };
