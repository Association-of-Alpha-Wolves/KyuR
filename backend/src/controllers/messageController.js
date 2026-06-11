import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   POST /api/messages/conversations
 * @access  Private
 * @desc    Get or create a conversation for an item (Finder initiates chat)
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { itemId } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    const error = new Error('Invalid item ID');
    error.statusCode = 400;
    throw error;
  }

  const item = await mongoose.model('Item').findById(itemId);
  if (!item) {
    const error = new Error('Item not found');
    error.statusCode = 404;
    throw error;
  }

  // If the user is the reporter, they cannot initiate a conversation
  // They can only view conversations that finders have started.
  if (item.reportedBy.toString() === userId.toString()) {
    const error = new Error('Reporters cannot initiate conversations on their own items');
    error.statusCode = 400;
    throw error;
  }

  let conversation = await Conversation.findOne({
    item: itemId,
    finder: userId
  });

  if (!conversation) {
    conversation = await Conversation.create({
      item: itemId,
      reporter: item.reportedBy,
      finder: userId,
      status: 'pending' // Initial status
    });
  }

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

/**
 * @route   GET /api/messages/conversations
 * @access  Private
 * @desc    Returns all conversations for the user along with their latest message
 */
export const getUserConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    $or: [{ reporter: userId }, { finder: userId }]
  })
    .populate('reporter', 'name _id')
    .populate('finder', 'name _id')
    .populate('item', 'title imageUrl status')
    .sort({ updatedAt: -1 });

  // Fetch the latest message for each conversation
  const conversationsWithLatestMessage = await Promise.all(
    conversations.map(async (conv) => {
      const latestMessage = await Message.findOne({ conversation: conv._id })
        .sort({ createdAt: -1 })
        .select('content createdAt isRead sender receiver');
      
      return {
        ...conv.toObject(),
        latestMessage
      };
    })
  );

  res.status(200).json({
    success: true,
    data: conversationsWithLatestMessage,
  });
});

/**
 * @route   GET /api/messages/conversations/:id
 * @access  Private
 * @desc    Returns the full message history for a given conversation
 */
export const getMessagesByConversation = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    const error = new Error('Invalid conversation ID');
    error.statusCode = 400;
    throw error;
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }

  // Ensure user is part of the conversation
  if (
    conversation.reporter.toString() !== req.user._id.toString() &&
    conversation.finder.toString() !== req.user._id.toString()
  ) {
    const error = new Error('Not authorized to view this conversation');
    error.statusCode = 403;
    throw error;
  }

  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 50);
  const skip  = (page - 1) * limit;

  const [total, messages] = await Promise.all([
    Message.countDocuments({ conversation: conversationId }),
    Message.find({ conversation: conversationId })
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
 * @route   PUT /api/messages/conversations/:id/status
 * @access  Private
 * @desc    Update conversation status (accept/cancel). Only reporter can do this.
 */
export const updateConversationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }

  if (conversation.reporter.toString() !== req.user._id.toString()) {
    const error = new Error('Only the reporter can accept or cancel a chat');
    error.statusCode = 403;
    throw error;
  }

  if (!['accepted', 'canceled'].includes(status)) {
    const error = new Error('Invalid status');
    error.statusCode = 400;
    throw error;
  }

  conversation.status = status;
  await conversation.save();

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

/**
 * @route   PUT /api/messages/conversations/:id/moderate
 * @access  Private
 * @desc    Mute, archive, or block a conversation
 */
export const moderateConversation = asyncHandler(async (req, res) => {
  const { action, value } = req.body; // action: 'mute', 'archive', 'block'. value: boolean
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }

  const userId = req.user._id;

  if (
    conversation.reporter.toString() !== userId.toString() &&
    conversation.finder.toString() !== userId.toString()
  ) {
    const error = new Error('Not authorized to moderate this conversation');
    error.statusCode = 403;
    throw error;
  }

  let targetArray;
  if (action === 'mute') targetArray = 'mutedBy';
  else if (action === 'archive') targetArray = 'archivedBy';
  else if (action === 'block') targetArray = 'blockedBy';
  else {
    const error = new Error('Invalid moderation action');
    error.statusCode = 400;
    throw error;
  }

  const index = conversation[targetArray].indexOf(userId);
  if (value && index === -1) {
    conversation[targetArray].push(userId);
  } else if (!value && index !== -1) {
    conversation[targetArray].splice(index, 1);
  }

  await conversation.save();

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

/**
 * @route   PUT /api/messages/:id/read
 * @access  Private
 * @desc    REST fallback for marking a message as read.
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
