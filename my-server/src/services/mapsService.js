const axios = require('axios');

class MapsService {
    async calculateRoute(origin, destination) {
        if (!process.env.GOOGLE_MAPS_API_KEY) {
            throw new Error("Missing Google Maps API Key");
        }

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;

        try {
            const response = await axios.get(url, {
                params: {
                    origins: origin,
                    destinations: destination,
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(response.data.error_message || "Failed to fetch route data");
            }

            // Extract the first element
            const element = response.data.rows[0].elements[0];

            if (element.status !== 'OK') {
                throw new Error("No route found between these locations");
            }

            return {
                distance: element.distance, // { text: "10 km", value: 10000 }
                duration: element.duration  // { text: "15 mins", value: 900 }
            };

        } catch (error) {
            console.error("Maps Service Error:", error.message);
            throw error;
        }
    }
}

module.exports = new MapsService();