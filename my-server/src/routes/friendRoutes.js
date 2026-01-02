
import express from 'express';
import friendController from '../controllers/friendController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.use(checkAuth);

router.post('/request', friendController.sendRequest);
router.get('/requests', friendController.getPendingRequests);
router.put('/requests/:id', friendController.respondToRequest);
router.get('/', friendController.getFriends);

export default router;
