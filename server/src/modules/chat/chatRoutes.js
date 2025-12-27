import express from 'express';
import * as chatController from './chatController.js';

const router = express.Router();

router.post('/send', chatController.chat);

export default router;
