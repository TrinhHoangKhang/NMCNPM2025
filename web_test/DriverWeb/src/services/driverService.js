import { apiClient } from './apiService';

export const driverService = {
    getDriver: async (id) => {
        return apiClient(`/drivers/${id}`);
    },

    updateDriver: async (id, driverData) => {
        // driverData: { vehicleType, licensePlate, etc. }
        return apiClient(`/drivers/${id}`, {
            method: 'PATCH',
            body: driverData
        });
    },

    updateStatus: async (status) => {
        // status: "ONLINE" | "OFFLINE" | "BUSY"
        return apiClient('/drivers/status', {
            method: 'PATCH',
            body: { status }
        });
    },

    updateLocation: async (id, location) => {
        // location: { lat, lng }
        return apiClient(`/drivers/${id}/location`, {
            method: 'PATCH',
            body: { location }
        });
    }
};
