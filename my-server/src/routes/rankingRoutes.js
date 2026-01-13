import express from 'express';
import rankingController from '../controllers/rankingController.js';

const router = express.Router();



// GET /api/ranks
router.get('/', rankingController.getLeaderboard);

// POST /api/ranks/update
router.post('/update', rankingController.updateScore);

// GET /api/ranks/:userId
router.get('/:userId', rankingController.getUserRank);

export default router;
