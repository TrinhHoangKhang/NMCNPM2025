const express = require('express');
const router = express.Router();

router.post('/send', (req, res) => {
    res.status(501).json({ message: "Chat not implemented yet" });
});

module.exports = router;
