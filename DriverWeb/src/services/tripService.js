import { apiClient } from './apiService';

export const tripService = {
    getAvailableTrips: async () => {
        return apiClient('/trips/available');
    },

    getCurrentTrip: async () => {
        // Backend endpoint: GET /api/trips/current
        // Note: Needs strict error handling if 404
        try {
            return await apiClient('/trips/current');
        } catch (e) {
            return null;
        }
    },

    getTripDetails: async (id) => {
        return apiClient(`/trips/${id}`);
    },

    acceptTrip: async (id) => {
        return apiClient(`/trips/${id}/accept`, {
            method: 'PATCH'
        });
    },

    markPickup: async (id) => {
        return apiClient(`/trips/${id}/pickup`, {
            method: 'PATCH'
        });
    },

    markComplete: async (id) => {
        return apiClient(`/trips/${id}/complete`, {
            method: 'PATCH'
        });
    },

    getDriverHistory: async () => {
        return apiClient('/trips/driver/history');
    },

    updateDriverStatus: async (status) => {
        return apiClient('/drivers/status', {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }
};
