import { Router } from 'express';
import { getMessagesByItem, markMessageAsRead } from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/:itemId', protect, getMessagesByItem);
router.put('/:id/read', protect, markMessageAsRead);

export default router;
