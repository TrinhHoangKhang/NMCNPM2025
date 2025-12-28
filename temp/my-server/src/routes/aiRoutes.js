const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const aiController = require('../controllers/aiController');

// Protect AI routes
router.use(checkAuth);

// POST /api/ai/commands - takes { text } and returns { commands: [...] }
router.post('/commands', aiController.generateCommands);

module.exports = router;

