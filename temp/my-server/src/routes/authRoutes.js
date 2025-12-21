const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Register Endpoint (from before)
router.post('/register', authController.register);

// POST http://localhost:3000/auth/login
router.post('/login', authController.login);

// Google Auth Routes
// 1. Redirect to Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Callback from Google
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleCallback
);

module.exports = router;