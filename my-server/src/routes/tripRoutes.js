import express from 'express';
import tripController from '../controllers/tripController.js';
import checkRole from '../middleware/checkRole.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

// Apply authentication middleware to all trip routes
router.use(checkAuth);

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Trip management endpoints
 */

/**
 * @swagger
 * /trips:
 *   get:
 *     summary: List all trips (Admin)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all trips
 */
// GET /api/trips - List all trips (ADMIN ONLY)
router.get('/', checkRole(['ADMIN']), tripController.getAllTrips);


//====== RIDER SIDE ======//
/**
 * @swagger
 * /trips/request:
 *   post:
 *     summary: Request a new trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickupLocation
 *               - dropoffLocation
 *               - vehicleType
 *               - paymentMethod
 *             properties:
 *               pickupLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               dropoffLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               vehicleType:
 *                 type: string
 *                 enum: [MOTORBIKE, 4 SEAT, 7 SEAT]
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, WALLET]
 *     responses:
 *       201:
 *         description: Trip requested successfully
 */
// POST /api/trips/request - Người dùng yêu cầu tạo một chuyến đi mới
// Input: { pickupLocation: { lat, lng }, dropoffLocation: { lat, lng }, vehicleType: "MOTORBIKE|4 SEAT|7 SEAT", paymentMethod: "CASH|WALLET" }
// NOTE: Hàm này trả về kết quả của route /estimate luôn 
router.post('/request', tripController.requestTrip);

/**
 * @swagger
 * /trips/current:
 *   get:
 *     summary: Get current active trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current trip details
 */
// GET /api/trips/current - Lấy thông tin chuyến đi hiện tại mới vừa request
// Input: none (Chỉ cần jwt token)
router.get('/current', tripController.getCurrentTrip);

/**
 * @swagger
 * /trips/estimate:
 *   post:
 *     summary: Estimate trip cost and route
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickupLocation
 *               - dropoffLocation
 *               - vehicleType
 *             properties:
 *               pickupLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               dropoffLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               vehicleType:
 *                 type: string
 *                 enum: [MOTORBIKE, 4 SEAT, 7 SEAT]
 *     responses:
 *       200:
 *         description: Trip estimation
 */
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

/**
 * @swagger
 * /trips/history:
 *   get:
 *     summary: Get user trip history
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User trip history
 * 
 * /trips/cancel:
 *   patch:
 *     summary: Cancel current trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trip cancelled
 */
// GET /api/trips/history - Trả về lịch sử các chuyến đi của người dùng
// Input: none (Chỉ cần jwt token)
router.get('/history', tripController.getTripHistory);

// PATCH /api/trips/cancel - Hủy chuyến đi hiện tại (Chỉ khi trạng thái là REQUESTED hoặc ACCEPTED
// Input: none (Chỉ cần jwt token)
router.patch('/cancel', tripController.cancelTrip);


/**
 * @swagger
 * /trips/available:
 *   get:
 *     summary: Get available trips (Driver)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available trips
 * 
 * /trips/{id}:
 *   get:
 *     summary: Get trip details
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip details
 * 
 * /trips/{id}/accept:
 *   patch:
 *     summary: Accept a trip (Driver)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip accepted
 * 
 * /trips/{id}/pickup:
 *   patch:
 *     summary: Mark trip as picked up (Driver)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip picked up
 * 
 * /trips/{id}/complete:
 *   patch:
 *     summary: Mark trip as completed (Driver)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip completed
 * 
 * /trips/driver/history:
 *   get:
 *     summary: Get driver trip history
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver trip history
 * 
 * /trips/{id}/rate:
 *   post:
 *     summary: Rate a trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trip rated
 */
// ====== DRIVER SIDE ======//
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

// POST /api/trips/:id/rate - Đánh giá chuyến đi (Rider Only)
// Input: rating (number 1-5), comment (string)
router.post('/:id/rate', tripController.rateTrip);

export default router;
