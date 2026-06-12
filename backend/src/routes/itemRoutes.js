import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItemStatus,
  deleteItem,
} from '../controllers/itemController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

router.get('/getItems', getItems);
router.post('/createItem', protect, upload.single('image'), createItem);
router.get('/:id', protect, getItemById);
router.put('/:id/status', protect, updateItemStatus);
router.delete('/:id', protect, deleteItem);

export default router;
