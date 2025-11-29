const express = require('express');
const router = express.Router();
// Import the API-specific controller
const apiUserController = require('../controllers/api/apiUserController');

// This actually matches "/api/login" because it's mounted on "/api" in app.js
router.post('/login', apiUserController.login);
router.get('/profile', apiUserController.getProfile);

module.exports = router;