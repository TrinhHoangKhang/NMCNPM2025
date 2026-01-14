import express from 'express';
import notificationController from '../controllers/notificationController.js';

const router = express.Router();

router.post('/send', notificationController.sendNotification);

export default router;
