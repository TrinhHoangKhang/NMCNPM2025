// server/src/routes/devRoutes.js
import express from 'express';
import * as devController from '../controllers/devController.js';

const router = express.Router();

// Middleware to restrict to localhost
const localOnly = (req, res, next) => {
    const hostname = req.hostname;
    // Some environments might include port or vary
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
        return next();
    }
    console.warn(`Dev route access denied for hostname: ${hostname}`);
    return res.status(403).json({
        success: false,
        error: 'Forbidden: Dev tools only accessible on localhost'
    });
};

router.use(localOnly);

router.get('/users', devController.getAllUsers);
router.get('/drivers', devController.getAllDrivers);
router.patch('/:type/:id', devController.updateUser);
router.delete('/:type/:id', devController.deleteUser);

export default router;
