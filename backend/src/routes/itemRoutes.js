import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItemStatus,
} from '../controllers/itemController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

// All item routes require authentication
router.use(protect);

router.post('/createItem', upload.single('image'), createItem);
router.get('/getItems', getItems);
router.get('/:id', getItemById);
router.put('/:id/status', updateItemStatus);

export default router;
