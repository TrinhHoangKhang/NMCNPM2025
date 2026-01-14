import express from 'express';
import discountController from '../controllers/discountController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

// Apply auth middleware
router.use(checkAuth);

/**
 * @swagger
 * /discounts:
 *   get:
 *     summary: Get all available discounts
 *     tags: [Discounts]
 *     responses:
 *       200:
 *         description: List of discounts
 */
// GET /api/discounts
router.get('/', discountController.getDiscounts);

// POST /api/discounts
router.post('/', discountController.createDiscount);

// GET /api/discounts/:id
router.get('/:id', discountController.getDiscountInfo);

// POST /api/discounts/claim
router.post('/claim', discountController.claimIdempotent || discountController.claimDiscount);

// PATCH /api/discounts/:id
router.patch('/:id', discountController.updateDiscount);

export default router;
