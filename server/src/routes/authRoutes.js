import express from 'express';
import * as authController from '../controllers/authController.js';
import passport from 'passport';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const router = express.Router();

// Register Endpoint (from before)
router.post('/register', validate(registerSchema), authController.register);

// POST http://localhost:3000/auth/login
router.post('/login', validate(loginSchema), authController.login);

// Google Auth Routes
// 1. Redirect to Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Callback from Google
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleCallback
);

export default router;