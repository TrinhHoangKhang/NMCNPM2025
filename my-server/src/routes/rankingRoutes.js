import express from 'express';
import rankingController from '../controllers/rankingController.js';

const router = express.Router();

// GET /api/ranks
router.get('/', rankingController.getLeaderboard);

export default router;
