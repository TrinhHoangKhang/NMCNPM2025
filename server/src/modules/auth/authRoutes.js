import express from 'express';
import * as authController from './authController.js';
import { validate } from '../../api/middlewares/validate.js';
import { loginSchema, registerSchema } from './authSchema.js';

const router = express.Router();

// Register Endpoint (from before)
router.post('/register', validate(registerSchema), authController.register);

// POST http://localhost:3000/auth/login
router.post('/login', validate(loginSchema), authController.login);

// Traditional Auth (Email/Password)
router.post('/register/traditional', authController.registerTraditional);
router.post('/login/traditional', authController.loginTraditional);

export default router;