const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const checkAuth = require('../middleware/checkAuth');
const checkDriver = require('../middleware/checkDriver');

// Apply authentication middleware to all trip routes
router.use(checkAuth);


//====== RIDER SIDE ======//
// POST /api/trips/request - Người dùng yêu cầu tạo một chuyến đi mới
// Input: { pickupLocation: { lat, lng }, dropoffLocation: { lat, lng }, vehicleType: "MOTORBIKE|4 SEAT|7 SEAT", paymentMethod: "CASH|WALLET" }
router.post('/request', tripController.requestTrip);

// GET /api/trips/current - Lấy thông tin chuyến đi hiện tại mới vừa request
// Input: none (Chỉ cần jwt token)
router.get('/current', tripController.getCurrentTrip);

// POST /api/trips/estimate - Ước tính chi phí, khoảng cách và thời gian chuyến đi (TRƯỚC KHI BẤM XÁC NHẬN - REQUEST)
// Input: { pickupLocation: { lat, lng }, dropoffLocation: { lat, lng }, vehicleType: "MOTORBIKE|4 SEAT|7 SEAT" }
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
router.get('/available', checkDriver, tripController.getAvailableTrips);

// GET /api/trips/:id - Lấy chi tiết một chuyến đi cụ thể bằng ID (Dùng cho cả Rider và Driver)
// Input: Id của chuyến đi 
router.get('/:id', tripController.getTripDetails);

// PATCH /api/trips/:id/accept - Driver nhận chuyến đi, trạng thái 'REQUESTED' -> 'ACCEPTED'
// Input: Id của chuyến đi
router.patch('/:id/accept', checkDriver, tripController.acceptTrip);

// PATCH  - Driver đến điểm đón, trạng thái 'ACCEPTED' -> 'IN_PROGRESS'
// Input: Id của chuyến đi
router.patch('/:id/pickup', checkDriver, tripController.markTripPickup);

// PATCH /api/trips/:id/complete - Driver hoàn thành chuyến đi, trạng thái 'IN_PROGRESS' -> 'COMPLETED'
// Input: Id của chuyến đi
router.patch('/:id/complete', checkDriver, tripController.markTripComplete);

// GET /api/trips/driver/history - Lấy lịch sử các chuyến đi của driver
// Input: none (Chỉ cần jwt token)
router.get('/driver/history', checkDriver, tripController.getDriverTripHistory);

module.exports = router;
