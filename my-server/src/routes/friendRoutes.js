
import express from 'express';
import friendController from '../controllers/friendController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.use(checkAuth);

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Friend management endpoints
 */

/**
 * @swagger
 * /friends/request:
 *   post:
 *     summary: Send friend request
 *     tags: [Friends]
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
 *             properties:
 *               receiverId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request sent
 * 
 * /friends/requests:
 *   get:
 *     summary: Get pending friend requests
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending requests
 * 
 * /friends/requests/{id}:
 *   put:
 *     summary: Respond to friend request
 *     tags: [Friends]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACCEPTED, REJECTED]
 *     responses:
 *       200:
 *         description: Response processed
 * 
 * /friends:
 *   get:
 *     summary: Get friends list
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Friends list
 */
router.post('/request', friendController.sendRequest);
router.get('/requests', friendController.getPendingRequests);
router.put('/requests/:id', friendController.respondToRequest);
router.get('/', friendController.getFriends);

export default router;
