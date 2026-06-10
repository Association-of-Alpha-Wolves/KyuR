import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/forgotpassword', authLimiter, forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
