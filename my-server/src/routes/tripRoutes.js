import express from 'express';
import tripController from '../controllers/tripController.js';
import checkRole from '../middleware/checkRole.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

// Apply authentication middleware to all trip routes
router.use(checkAuth);

// GET /api/trips - List all trips (ADMIN ONLY)
router.get('/', checkRole(['ADMIN']), tripController.getAllTrips);


//====== RIDER SIDE ======//
// POST /api/trips/request - Người dùng yêu cầu tạo một chuyến đi mới
// Input: { pickupLocation: { lat, lng }, dropoffLocation: { lat, lng }, vehicleType: "MOTORBIKE|4 SEAT|7 SEAT", paymentMethod: "CASH|WALLET" }
// NOTE: Hàm này trả về kết quả của route /estimate luôn 
router.post('/request', tripController.requestTrip);

// GET /api/trips/current - Lấy thông tin chuyến đi hiện tại mới vừa request
// Input: none (Chỉ cần jwt token)
router.get('/current', tripController.getCurrentTrip);

// POST /api/trips/estimate - Ước tính chi phí, khoảng cách, thời gian và lộ trình chuyến đi (TRƯỚC KHI BẤM XÁC NHẬN - REQUEST)
// Input: { pickupLocation: { lat, lng }, dropoffLocation: { lat, lng }, vehicleType: "MOTORBIKE|4 SEAT|7 SEAT" }
// NOTE: Path trả về sẽ có dạng:
// {
//   "type": "LineString",
//   "coordinates": [
//     { "lat": 10.1234, "lng": 106.1234 },
//     { "lat": 10.1240, "lng": 106.1250 },
//     ...
//   ]
// }
router.post('/estimate', tripController.getTripEstimate);

// GET /api/trips/history - Trả về lịch sử các chuyến đi của người dùng
// Input: none (Chỉ cần jwt token)
router.get('/history', tripController.getTripHistory);

// PATCH /api/trips/cancel - Hủy chuyến đi hiện tại (Chỉ khi trạng thái là REQUESTED hoặc ACCEPTED
// Input: none (Chỉ cần jwt token)
router.patch('/cancel', tripController.cancelTrip);


//====== DRIVER SIDE ======//
// GET /api/trips/available - Driver Lấy danh sách các chuyến đi đang chờ (status REQUESTED)
// Input: none (Chỉ cần jwt token)
router.get('/available', checkRole(['DRIVER']), tripController.getAvailableTrips);

// GET /api/trips/:id - Lấy chi tiết một chuyến đi cụ thể bằng ID (Dùng cho cả Rider và Driver)
// Input: Id của chuyến đi 
router.get('/:id', tripController.getTripDetails);

// PATCH /api/trips/:id/accept - Driver nhận chuyến đi, trạng thái 'REQUESTED' -> 'ACCEPTED'
// Input: Id của chuyến đi
router.patch('/:id/accept', checkRole(['DRIVER']), tripController.acceptTrip);

// PATCH  - Driver đến điểm đón, trạng thái 'ACCEPTED' -> 'IN_PROGRESS'
// Input: Id của chuyến đi
router.patch('/:id/pickup', checkRole(['DRIVER']), tripController.markTripPickup);

// PATCH /api/trips/:id/complete - Driver hoàn thành chuyến đi, trạng thái 'IN_PROGRESS' -> 'COMPLETED'
// Input: Id của chuyến đi
router.patch('/:id/complete', checkRole(['DRIVER']), tripController.markTripComplete);

// GET /api/trips/driver/history - Lấy lịch sử các chuyến đi của driver
// Input: none (Chỉ cần jwt token)
router.get('/driver/history', checkRole(['DRIVER']), tripController.getDriverTripHistory);

export default router;
