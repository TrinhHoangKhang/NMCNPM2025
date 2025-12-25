import axios from 'axios';

class MapsService {
    constructor() {
        this.apiKey = process.env.GRAPHHOPPER_API_KEY;
        this.baseUrl = process.env.GRAPHHOPPER_BASE_URL || 'https://graphhopper.com/api/1/route';
    }

    formatPoint(point) {
        if (typeof point === 'string') return point;
        if (point && typeof point.lat !== 'undefined' && typeof point.lng !== 'undefined') {
            return `${point.lat},${point.lng}`;
        }
        throw new Error('Invalid point; expected {lat,lng} or "lat,lng" string');
    }

    async calculateRoute(origin, destination) {
        if (!this.apiKey) {
            throw new Error('GRAPHHOPPER_API_KEY is missing');
        }

        const originStr = this.formatPoint(origin);
        const destStr = this.formatPoint(destination);

        try {
            const params = new URLSearchParams();
            params.append('point', originStr);
            params.append('point', destStr);
            params.append('vehicle', 'car');
            params.append('locale', 'en');
            params.append('key', this.apiKey);
            params.append('type', 'json');
            params.append('points_encoded', 'false');

            const response = await axios.get(this.baseUrl, {
                params,
                timeout: 8000
            });

            const path = response.data?.paths?.[0];
            if (!path) {
                throw new Error('No route returned from GraphHopper');
            }

            // GraphHopper returns GeoJSON when points_encoded=false; coordinates are [lng, lat]
            const coordinatesLngLat = path.points?.coordinates || [];
            const coordinatesLatLng = coordinatesLngLat.map(([lng, lat]) => ({ lat, lng }));

            return {
                distance: {
                    text: `${(path.distance / 1000).toFixed(1)} km`,
                    value: path.distance
                },
                duration: {
                    text: `${Math.round(path.time / 60000)} mins`,
                    value: Math.round(path.time / 1000)
                },
                geometry: {
                    type: 'LineString',
                    coordinates: coordinatesLatLng
                },
                bbox: path.bbox || null
            };
        } catch (error) {
            const status = error.response?.status;
            const body = error.response?.data;
            console.error('GraphHopper Error:', status, body || error.message);
            const detail = status ? `status ${status}` : error.message;
            throw new Error(`Failed to calculate route via GraphHopper (${detail})`);
        }
    }

    /**
     * Google Maps Distance Matrix API
     * Returns distances/durations for multiple origins and destinations
     */
    async getDistanceMatrix(origins, destinations) {
        const googleApiKey = process.env.GOOGLE_MAPS_KEY;
        if (!googleApiKey) {
            console.warn('GOOGLE_MAPS_KEY is missing. Distance Matrix features will be limited.');
            return null;
        }

        const originsStr = origins.map(o => this.formatPoint(o)).join('|');
        const destinationsStr = destinations.map(d => this.formatPoint(d)).join('|');

        try {
            const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
                params: {
                    origins: originsStr,
                    destinations: destinationsStr,
                    key: googleApiKey,
                    mode: 'driving'
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Distance Matrix API error: ${response.data.status}`);
            }

            return response.data;
        } catch (error) {
            console.error('Distance Matrix Error:', error.response?.data || error.message);
            return null;
        }
    }
}

export default new MapsService();