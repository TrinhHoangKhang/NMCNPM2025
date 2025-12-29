import { apiClient } from './apiService';

export const tripService = {
    getAvailableTrips: async () => {
        return apiClient('/trips/available');
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
    }
};
