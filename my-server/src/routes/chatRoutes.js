
import express from 'express';
import chatController from '../controllers/chatController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.use(checkAuth);

router.post('/send', chatController.sendMessage);
router.get('/history/:friendId', chatController.getHistory);

export default router;
