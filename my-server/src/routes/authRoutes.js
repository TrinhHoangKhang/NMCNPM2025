import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';
import passport from 'passport';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - phone
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [RIDER, DRIVER, ADMIN]
 *               vehicleType:
 *                 type: string
 *                 description: Required if role is DRIVER
 *               licensePlate:
 *                 type: string
 *                 description: Required if role is DRIVER
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
// Register Endpoint (from before)
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */
// POST http://localhost:3000/auth/login
router.post('/login', authController.login);

// Google Auth Routes
// 1. Redirect to Google
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Callback from Google
// router.get('/google/callback',
//     passport.authenticate('google', { session: false, failureRedirect: '/login' }),
//     authController.googleCallback
// );

export default router;