import mongoose from 'mongoose';
import Message from '../models/Message.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   GET /api/messages/:itemId
 * @access  Private
 * @desc    Returns the full message history for a given item, sorted oldest-first
 *          so the client can render the chat thread in chronological order.
 */
export const getMessagesByItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    const error = new Error('Invalid item ID');
    error.statusCode = 400;
    throw error;
  }

  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 50);
  const skip  = (page - 1) * limit;

  const [total, messages] = await Promise.all([
    Message.countDocuments({ item: itemId }),
    Message.find({ item: itemId })
      .populate('sender', 'name _id')
      .populate('receiver', 'name _id')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.status(200).json({
    success: true,
    data: {
      messages,
      page,
      pages: Math.ceil(total / limit),
      total,
    },
  });
});

/**
 * @route   PUT /api/messages/:id/read
 * @access  Private
 * @desc    REST fallback for marking a message as read.
 *          Only the intended receiver may mark a message as read.
 */
export const markMessageAsRead = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new Error('Invalid message ID');
    error.statusCode = 400;
    throw error;
  }

  const message = await Message.findById(req.params.id);

  if (!message) {
    const error = new Error('Message not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorisation check — only the receiver can mark a message as read
  if (message.receiver.toString() !== req.user._id.toString()) {
    const error = new Error('Not authorised — only the message receiver can mark it as read');
    error.statusCode = 403;
    throw error;
  }

  message.isRead = true;
  await message.save();

  res.status(200).json({
    success: true,
    data: message,
  });
});
