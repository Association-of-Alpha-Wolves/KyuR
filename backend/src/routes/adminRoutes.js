import express from 'express';
import { getMetrics } from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Secured route: requires valid token and admin role
router.get('/metrics', protect, admin, getMetrics);

export default router;
