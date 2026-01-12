import axios from 'axios';

class MapsService {
    constructor() {
        // 1. Đọc cấu hình từ file .env
        this.googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.graphhopperApiKey = process.env.GRAPHHOPPER_API_KEY;
        
        // URL API
        this.googleBaseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
        this.graphhopperBaseUrl = process.env.GRAPHHOPPER_BASE_URL || 'https://graphhopper.com/api/1/route';
    }

    // Hàm tiện ích: Chuyển đổi tọa độ thành chuỗi "lat,lng"
    formatPoint(point) {
        if (typeof point === 'string') return point;
        if (point && typeof point.lat !== 'undefined' && typeof point.lng !== 'undefined') {
            return `${point.lat},${point.lng}`;
        }
        throw new Error('Invalid point; expected {lat,lng} or "lat,lng" string');
    }

    // --- HÀM CHÍNH: TÍNH TOÁN ĐƯỜNG ĐI ---
    async calculateRoute(origin, destination) {
        // Ưu tiên 1: Kiểm tra Key Google Maps trước
        if (this.googleApiKey && this.googleApiKey.length > 0) {
            console.log("Using Google Maps API for route calculation...");
            return this.calculateRouteGoogle(origin, destination);
        }

        // Ưu tiên 2: Kiểm tra Key GraphHopper
        if (this.graphhopperApiKey && this.graphhopperApiKey.length > 0) {
            console.log("Using GraphHopper API for route calculation...");
            return this.calculateRouteGraphHopper(origin, destination);
        }

        // Ưu tiên 3: Nếu không có Key nào -> Dùng dữ liệu giả (Mock)
        console.warn('MISSING ALL API KEYS. Using Mock Data.');
        return this.getMockData(origin, destination);
    }

    // --- LOGIC GỌI GOOGLE MAPS API ---
    async calculateRouteGoogle(origin, destination) {
        try {
            const originStr = this.formatPoint(origin);
            const destStr = this.formatPoint(destination);

            const response = await axios.get(this.googleBaseUrl, {
                params: {
                    origin: originStr,
                    destination: destStr,
                    key: this.googleApiKey,
                    mode: 'driving' // Chế độ lái xe
                },
                timeout: 10000 // Timeout 10 giây
            });

            const data = response.data;

            // Kiểm tra lỗi từ Google trả về
            if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
                console.error('Google Maps API Error:', data.status, data.error_message);
                // Nếu lỗi thì fallback về Mock
                return this.getMockData(origin, destination);
            }

            // Lấy thông tin từ tuyến đường đầu tiên (Route 0, Leg 0)
            const route = data.routes[0];
            const leg = route.legs[0];

            return {
                distance: {
                    text: leg.distance.text,      // Ví dụ: "5.2 km"
                    value: leg.distance.value     // Ví dụ: 5200 (mét) -> Quan trọng để tính tiền
                },
                duration: {
                    text: leg.duration.text,      // Ví dụ: "15 mins"
                    value: leg.duration.value     // Ví dụ: 900 (giây)
                },
                geometry: {
                    // Google trả về Encoded Polyline
                    type: 'EncodedPolyline',
                    coordinates: route.overview_polyline.points 
                }
            };

        } catch (error) {
            console.error('Failed to fetch from Google Maps:', error.message);
            // Fallback an toàn
            return this.getMockData(origin, destination);
        }
    }

    // --- LOGIC GỌI GRAPHHOPPER API (Code cũ của bạn) ---
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
            params.append('type', 'json');
            params.append('points_encoded', 'false');

            const response = await axios.get(this.graphhopperBaseUrl, {
                params,
                timeout: 8000
            });

            const path = response.data?.paths?.[0];
            if (!path) throw new Error('No route returned from GraphHopper');

            const coordinatesLngLat = path.points?.coordinates || [];
            // Đảo ngược [lng, lat] thành {lat, lng}
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
            console.error('GraphHopper Error:', error.message);
            // Nếu GraphHopper lỗi, fallback về Mock
            return this.getMockData(origin, destination);
        }
    }

    // --- DỮ LIỆU GIẢ (MOCK DATA) ---
    getMockData(origin, destination) {
        return {
            distance: { text: '1.5 km (MOCK)', value: 1500 },
            duration: { text: '5 mins', value: 300 },
            geometry: {
                type: 'LineString',
                coordinates: [] // Trả về rỗng để đỡ lỗi vẽ map
            },
            bbox: null
        };
    }
}

export default new MapsService();