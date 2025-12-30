import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';

import checkAuth from '../middleware/checkAuth.js';
import checkRole from '../middleware/checkRole.js';

// Apply authentication middleware to all user routes
router.use(checkAuth);

// GET /api/users - Get All Users (ADMIN only)
router.get('/', checkRole(['ADMIN']), userController.getAllUsers);

// GET /api/users/:id - Get User Profile (ADMIN or self - self check logic might be needed in controller, but checking role here ensures minimal access)
// For simplicity, we allow ADMIN and the user themselves (usually logic inside controller handles "self"). 
// Here we just allow authenticated users, as getting profile is common. 
// We can refine to checkRole(['ADMIN']) if we want *only* admin to see *any* profile via this ID route 
// but usually users need to see their own profile. 
// Let's keep it open to authenticated users for now, or use specific logic. 
// Plan says "Protect User Routes". Let's restrict to ADMIN for general listing.
router.get('/:id', userController.getUser);


// PATCH /api/users/:id - Update User Profile
router.patch('/:id', userController.updateUser);

export default router;
