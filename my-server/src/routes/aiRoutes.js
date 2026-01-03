import express from 'express';
const router = express.Router();
import checkAuth from '../middleware/checkAuth.js';
import aiController from '../controllers/aiController.js';

// Protect AI routes
router.use(checkAuth);

// AI function 1: Get the intention of the user and give the instruction for the mobile app
router.post('/command', aiController.getCommandInstruction);

// AI function 2: Get the query of the user about the trip history and answer accordingly what the user wants
router.post('/query', aiController.getQueryResponse);

export default router;

