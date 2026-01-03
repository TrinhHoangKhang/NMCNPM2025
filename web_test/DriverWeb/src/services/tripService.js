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

    markComplete: async (id, data = {}) => {
        return apiClient(`/trips/${id}/complete`, {
            method: 'PATCH',
            body: data
        });
    },

    getDriverHistory: async () => {
        return apiClient('/trips/driver/history');
    },

    getDriverStats: async () => {
        return apiClient('/drivers/stats');
    },

    getUserDetails: async (userId) => {
        return apiClient(`/users/${userId}`);
    },

    cancelTrip: async (id) => {
        return apiClient('/trips/cancel', {
            method: 'PATCH',
            body: { tripId: id }
        });
    },

    updateDriverStatus: async (status) => {
        return apiClient('/drivers/status', {
            method: 'PATCH',
            body: { status }
        });
    },

    getRoute: async (pickup, dropoff) => {
        // pickup/dropoff = { lat, lng }
        if (!pickup?.lat || !dropoff?.lat) return null;

        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data.routes || data.routes.length === 0) throw new Error("No route found");

            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] })); // Convert to object format if component expects it, or array? Local state used lat,lng objects? 
            // Leaflet Polyline expects [lat, lng] arrays. 
            // My MapComponent expects [lat, lng] arrays for routePath.
            // But simulation logic might update markers which usually take {lat, lng} or [lat, lng].
            // Let's stick to [lat, lng] arrays for path.

            const path = route.geometry.coordinates.map(c => [c[1], c[0]]);

            return {
                path: path,
                distance: (route.distance / 1000).toFixed(1),
                duration: Math.round(route.duration / 60)
            };
        } catch (error) {
            console.error("Routing error", error);
            return {
                path: [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]],
                distance: 0,
                duration: 0
            };
        }
    }
};
