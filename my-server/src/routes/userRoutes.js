import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';

import checkAuth from '../middleware/checkAuth.js';

// Apply authentication middleware to all user routes
router.use(checkAuth);

// GET /api/users/:id - Get User Profile
router.get('/:id', userController.getUser);


// PATCH /api/users/:id - Update User Profile
router.patch('/:id', userController.updateUser);

export default router;
