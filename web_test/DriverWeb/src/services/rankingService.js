import { apiClient } from './apiService';

export const rankingService = {
    /**
     * Get the global leaderboard.
     * @returns {Promise<Array>} List of top drivers
     */
    getLeaderboard: async () => {
        try {
            const res = await apiClient('/ranks');
            return (res && res.success) ? res.data : [];
        } catch (e) {
            console.error("Failed to fetch leaderboard", e);
            return [];
        }
    },

    /**
     * Get the ranking of a specific user.
     * @param {string} userId 
     * @returns {Promise<Object>} { rank, score }
     */
    getUserRank: async (userId) => {
        try {
            const res = await apiClient(`/ranks/${userId}`);
            return (res && res.success) ? res.data : null;
        } catch (e) {
            console.error("Failed to fetch user rank", e);
            return null;
        }
    }
};
