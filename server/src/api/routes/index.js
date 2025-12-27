import express from 'express';
import authRoutes from '../../modules/auth/authRoutes.js';
import chatRoutes from '../../modules/chat/chatRoutes.js';
import mapRoutes from '../../modules/maps/mapRoutes.js';
import driverRoutes from '../../modules/drivers/driverRoutes.js';
import userRoutes from '../../modules/users/userRoutes.js';
import aiRoutes from '../../modules/ai/aiRoutes.js';
import fareRoutes from '../../modules/maps/fareRoutes.js';
import rideRoutes from '../../modules/rides/rideRoutes.js';
import devRoutes from './devRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/maps', mapRoutes);
router.use('/drivers', driverRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/fares', fareRoutes);
router.use('/rides', rideRoutes);
router.use('/dev', devRoutes);

export default router;
