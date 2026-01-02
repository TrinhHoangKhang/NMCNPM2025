import { apiClient } from './apiService';

export const tripService = {
    requestTrip: async (tripData) => {
        // tripData: { pickupLocation, dropoffLocation, vehicleType, paymentMethod }
        return apiClient('/trips/request', {
            method: 'POST',
            body: tripData
        });
    },

    getCurrentTrip: async () => {
        return apiClient('/trips/current');
    },

    estimateTrip: async (estimateData) => {
        // estimateData: { pickupLocation, dropoffLocation, vehicleType }
        return apiClient('/trips/estimate', {
            method: 'POST',
            body: estimateData
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
            method: 'PATCH',
            body: {} // Ensure body exists
        });
    },

    getRoute: async (pickup, dropoff) => {
        // pickup/dropoff = { address, lat, lng }
        if (!pickup?.lat || !dropoff?.lat) return null;

        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data.routes || data.routes.length === 0) throw new Error("No route found");

            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]]); // Swap lng,lat to lat,lng

            console.log("OSRM Found Route with points:", coords.length);

            return {
                path: coords,
                distance: (route.distance / 1000).toFixed(1), // km
                duration: Math.round(route.duration / 60) // min
            };
        } catch (error) {
            console.error("Routing error", error);
            // Fallback to straight line
            return {
                path: [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]],
                distance: 0,
                duration: 0
            };
        }
    },

    reverseGeocode: async (lat, lng) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'RideGo-App/1.0' // Required by Nominatim
                }
            });
            const data = await response.json();
            // Return display_name or a constructed address
            return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } catch (error) {
            console.error("Reverse Geocoding Error:", error);
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    }
};
