import express from 'express';
const router = express.Router();
import checkAuth from '../middleware/checkAuth.js';
import aiController from '../controllers/aiController.js';

// Protect AI routes
router.use(checkAuth);

// POST /api/ai/commands - takes { text } and returns { commands: [...] }
router.post('/commands', aiController.generateCommands);

export default router;

