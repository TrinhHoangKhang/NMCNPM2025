
import express from 'express';
import chatController from '../controllers/chatController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.use(checkAuth);

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat endpoints
 */

/**
 * @swagger
 * /chat/send:
 *   post:
 *     summary: Send a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - message
 *             properties:
 *               receiverId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 * 
 * /chat/history/{friendId}:
 *   get:
 *     summary: Get chat history
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat history
 */
router.post('/send', chatController.sendMessage);
router.get('/history/:friendId', chatController.getHistory);

export default router;
