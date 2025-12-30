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
            // Mock response for development if API key is missing
            console.warn('GRAPHHOPPER_API_KEY missing, using mock route data.');
            return {
                distance: { text: '1.5 km', value: 1500 },
                duration: { text: '5 mins', value: 300 },
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [origin.lng || 106.660, origin.lat || 10.762],
                        [destination.lng || 106.700, destination.lat || 10.776]
                    ]
                },
                bbox: null
            };
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
}

export default new MapsService();