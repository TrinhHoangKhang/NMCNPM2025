import { apiClient } from './apiService';

export const tripService = {
    requestTrip: async (tripData) => {
        // tripData: { pickupLocation, dropoffLocation, vehicleType, paymentMethod }
        return apiClient('/trips/request', {
            method: 'POST',
            body: JSON.stringify(tripData)
        });
    },

    getCurrentTrip: async () => {
        return apiClient('/trips/current');
    },

    estimateTrip: async (estimateData) => {
        // estimateData: { pickupLocation, dropoffLocation, vehicleType }
        return apiClient('/trips/estimate', {
            method: 'POST',
            body: JSON.stringify(estimateData)
        });
    },

    getTripHistory: async () => {
        return apiClient('/trips/history');
    },

    getTripDetails: async (id) => {
        return apiClient(`/trips/${id}`);
    },

    cancelTrip: async () => {
        return apiClient('/trips/cancel', {
            method: 'PATCH'
        });
    }
};
