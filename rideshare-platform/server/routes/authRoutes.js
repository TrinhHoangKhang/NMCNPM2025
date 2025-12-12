const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getAllUsers, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/login', loginUser);
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, getAllUsers); // Should be authorize('admin') in prod
router.delete('/users/:id', protect, deleteUser);

module.exports = router;
