import { apiClient } from './apiService';

export const rankingService = {
    /**
     * Get the global leaderboard.
     * @param {string} role - 'DRIVER' or 'RIDER'
     * @returns {Promise<Array>} List of top users
     */
    getLeaderboard: async (role = 'DRIVER') => {
        try {
            const res = await apiClient(`/ranks?role=${role}`);
            return (res && res.success) ? res.data : [];
        } catch (e) {
            console.error("Failed to fetch leaderboard", e);
            return [];
        }
    },

    /**
     * Get the ranking of a specific user.
     * @param {string} userId 
     * @param {string} role
     * @returns {Promise<Object>} { rank, score }
     */
    getUserRank: async (userId, role = 'DRIVER') => {
        try {
            const res = await apiClient(`/ranks/${userId}?role=${role}`);
            return (res && res.success) ? res.data : null;
        } catch (e) {
            console.error("Failed to fetch user rank", e);
            return null;
        }
    }
};
