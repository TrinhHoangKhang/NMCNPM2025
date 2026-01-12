import express from 'express';
import paymentController from '../controllers/paymentController.js';
import checkAuth from '../middleware/checkAuth.js';
import checkDriver from '../middleware/checkDriver.js';

const router = express.Router();

// Apply authentication middleware to  all payment routes
router.use(checkAuth);

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment endpoints
 */

/**
 * @swagger
 * /payments/{id}/pay:
 *   get:
 *     summary: Generate payment QR (Rider)
 *     tags: [Payments]
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
 *         description: Payment QR
 * 
 * /payments/{id}/pay_confirm:
 *   post:
 *     summary: Confirm payment (Driver)
 *     tags: [Payments]
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
 *         description: Payment confirmed
 */
// 1. Rider gọi để lấy mã QR thanh toán (Chỉ khi paymentMethod là WALLET)
router.get('/:id/pay', paymentController.generatePaymentQR);

// 2. Driver gọi để xác nhận đã nhận được tiền
router.post('/:id/pay_confirm', checkDriver, paymentController.confirmPayment);
export default router;