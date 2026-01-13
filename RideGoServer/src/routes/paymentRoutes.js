import express from 'express';
import paymentController from '../controllers/paymentController.js';
import checkAuth from '../middleware/checkAuth.js';
import checkDriver from '../middleware/checkDriver.js';

const router = express.Router();

// Apply authentication middleware to  all payment routes
router.use(checkAuth);

// 1. Rider gọi để lấy mã QR thanh toán (Chỉ khi paymentMethod là WALLET)
router.get('/:id/pay', paymentController.generatePaymentQR);

// 2. Driver gọi để xác nhận đã nhận được tiền
router.post('/:id/pay_confirm', checkDriver, paymentController.confirmPayment);
export default router;