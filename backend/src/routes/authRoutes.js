import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/verify/:token', verifyEmail);
router.post('/forgotpassword', authLimiter, forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.get('/profile', protect, getProfile);

export default router;
