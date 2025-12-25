import express from 'express';
import checkAuth from '../middleware/checkAuth.js';
import aiController from '../controllers/aiController.js';

const router = express.Router();

// Protect AI routes
router.use(checkAuth);

// POST /api/ai/commands - takes { text } and returns { commands: [...] }
router.post('/commands', aiController.generateCommands);

export default router;
