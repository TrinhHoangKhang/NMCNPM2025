import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';

import checkAuth from '../middleware/checkAuth.js';
import checkRole from '../middleware/checkRole.js';

// Apply authentication middleware to all user routes
router.use(checkAuth);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
// GET /api/users - Get All Users (ADMIN only)
router.get('/', checkRole(['ADMIN']), userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated
 */
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

// DELETE /api/users/:id - Delete User (ADMIN only)
router.delete('/:id', checkRole(['ADMIN']), userController.deleteUser);

// POST /api/users/:id/favorites - Add Favorite Location
router.post('/:id/favorites', userController.addFavoriteLocation);

// GET /api/users/:id/favorites - Get Favorite Locations
router.get('/:id/favorites', userController.getFavoriteLocations);

export default router;
