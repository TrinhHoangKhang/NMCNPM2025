import express from 'express';
import rankingController from '../controllers/rankingController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ranking
 *   description: Driver ranking endpoints
 */

/**
 * @swagger
 * /ranks:
 *   get:
 *     summary: Get driver leaderboard
 *     tags: [Ranking]
 *     responses:
 *       200:
 *         description: Leaderboard
 */
// GET /api/ranks
router.get('/', rankingController.getLeaderboard);

export default router;
