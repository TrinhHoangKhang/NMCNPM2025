import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/:id - Get User Profile
router.get('/:id', userController.getUser);

// PATCH /api/users/:id - Update User Profile
router.patch('/:id', userController.updateUser);

export default router;
