import { Router } from 'express';
import { 
  getOrCreateConversation,
  getMessagesByConversation, 
  markMessageAsRead, 
  getUserConversations,
  updateConversationStatus,
  moderateConversation
} from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/conversations', protect, getOrCreateConversation);
router.get('/conversations', protect, getUserConversations);
router.get('/conversations/:id', protect, getMessagesByConversation);
router.put('/conversations/:id/status', protect, updateConversationStatus);
router.put('/conversations/:id/moderate', protect, moderateConversation);
router.put('/:id/read', protect, markMessageAsRead);

export default router;
