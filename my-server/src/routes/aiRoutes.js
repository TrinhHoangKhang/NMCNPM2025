import express from 'express';
const router = express.Router();
import checkAuth from '../middleware/checkAuth.js';
import aiController from '../controllers/aiController.js';

// Protect AI routes
router.use(checkAuth);

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI assistant endpoints
 */

/**
 * @swagger
 * /ai/command:
 *   post:
 *     summary: Get command instruction from AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Command instruction
 * 
 * /ai/query:
 *   post:
 *     summary: Query trip history with AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI response
 */
// AI function 1: Get the intention of the user and give the instruction for the mobile app
router.post('/command', aiController.getCommandInstruction);

// AI function 2: Get the query of the user about the trip history and answer accordingly what the user wants
router.post('/query', aiController.getQueryResponse);

export default router;

