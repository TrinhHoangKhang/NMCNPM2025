import axios from 'axios';

class MapsService {
    constructor() {
        this.googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.graphhopperApiKey = process.env.GRAPHHOPPER_API_KEY;
        
        this.googleBaseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
        this.graphhopperBaseUrl = process.env.GRAPHHOPPER_BASE_URL || 'https://graphhopper.com/api/1/route';
    }

    formatPoint(point) {
        if (typeof point === 'string') return point;
        if (point && typeof point.lat !== 'undefined' && typeof point.lng !== 'undefined') {
            return `${point.lat},${point.lng}`;
        }
        throw new Error('Invalid point; expected {lat,lng} or "lat,lng" string');
    }

    async calculateRoute(origin, destination, vehicleType) {
        if (this.googleApiKey && this.googleApiKey.length > 0) {
            console.log(`Using Google Maps API (${vehicleType || 'Default'})...`);
            return this.calculateRouteGoogle(origin, destination, vehicleType);
        }

        if (this.graphhopperApiKey && this.graphhopperApiKey.length > 0) {
            console.log("Using GraphHopper API for route calculation...");
            return this.calculateRouteGraphHopper(origin, destination);
        }

        console.warn('MISSING ALL API KEYS. Using Mock Data.');
        return this.getMockData(origin, destination);
    }

    async calculateRouteGoogle(origin, destination, vehicleType = 'RideGo Bike') {
        try {
            const originStr = this.formatPoint(origin);
            const destStr = this.formatPoint(destination);

            let mode = 'driving';
            if (vehicleType === 'RideGo Bike') {
                mode = 'two_wheeler';
            }

            const response = await axios.get(this.googleBaseUrl, {
                params: {
                    origin: originStr,
                    destination: destStr,
                    key: this.googleApiKey,
                    mode: mode,
                    departure_time: 'now',
                    traffic_model: 'best_guess',
                    alternatives: true
                },
                timeout: 10000
            });

            const data = response.data;

            if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
                console.error('Google Maps API Error:', data.status, data.error_message);
                return this.getMockData(origin, destination);
            }

            const route = data.routes[0];
            const leg = route.legs[0];

            const realDuration = leg.duration_in_traffic || leg.duration;

            return {
                distance: {
                    text: leg.distance.text,
                    value: leg.distance.value
                },
                duration: {
                    text: realDuration.text, 
                    value: realDuration.value
                },
                geometry: {
                    type: 'EncodedPolyline',
                    coordinates: route.overview_polyline.points 
                },
                summary: route.summary
            };

        } catch (error) {
            console.error('Failed to fetch from Google Maps:', error.message);
            return this.getMockData(origin, destination);
        }
    }

    async calculateRouteGraphHopper(origin, destination) {
        const originStr = this.formatPoint(origin);
        const destStr = this.formatPoint(destination);

        try {
            const params = new URLSearchParams();
            params.append('point', originStr);
            params.append('point', destStr);
            params.append('vehicle', 'car');
            params.append('locale', 'en');
            params.append('key', this.graphhopperApiKey);
            params.append('points_encoded', 'false');

            const response = await axios.get(this.graphhopperBaseUrl, { params, timeout: 8000 });
            const path = response.data?.paths?.[0];
            if (!path) throw new Error('No route returned from GraphHopper');

            const coordinatesLngLat = path.points?.coordinates || [];
            const coordinatesLatLng = coordinatesLngLat.map(([lng, lat]) => ({ lat, lng }));

            return {
                distance: { text: `${(path.distance / 1000).toFixed(1)} km`, value: path.distance },
                duration: { text: `${Math.round(path.time / 60000)} mins`, value: Math.round(path.time / 1000) },
                geometry: { type: 'LineString', coordinates: coordinatesLatLng },
                bbox: path.bbox || null
            };
        } catch (error) {
            console.error('GraphHopper Error:', error.message);
            return this.getMockData(origin, destination);
        }
    }

    getMockData(origin, destination) {
        return {
            distance: { text: '1.5 km (MOCK)', value: 1500 },
            duration: { text: '5 mins', value: 300 },
            geometry: {
                type: 'EncodedPolyline',
                coordinates: ""
            },
            bbox: null
        };
    }
}

export default new MapsService();