import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Item from '../models/Item.js';

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ─── Socket Authentication Middleware ────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication error: no token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error('Authentication error: token is invalid or expired'));
    }
  });

  // ─── Connection Handler ───────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.data.userId})`);
    
    // Join a personal room for global user notifications
    socket.join(`user_${socket.data.userId}`);

    // ── join_room ──────────────────────────────────────────────────────────────
    // Client emits: { conversationId: string }
    socket.on('join_room', async ({ conversationId }) => {
      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        socket.emit('error', { message: 'Invalid conversation ID' });
        return;
      }

      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const userId = socket.data.userId;
        if (
          conversation.reporter.toString() !== userId &&
          conversation.finder.toString() !== userId
        ) {
          socket.emit('error', { message: 'Not authorized to join this room' });
          return;
        }

        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined room: ${conversationId}`);
      } catch (err) {
        console.error(`join_room error (conversationId: ${conversationId}):`, err.message);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // ── send_message ───────────────────────────────────────────────────────────
    socket.on('send_message', async ({ conversationId, itemId, content }) => {
      console.log('[send_message] received', { conversationId, itemId, userId: socket.data.userId, contentLen: content?.length });

      if (!conversationId || !itemId || !content?.trim()) {
        console.warn('[send_message] REJECTED — missing field', { conversationId: !!conversationId, itemId: !!itemId, hasContent: !!content?.trim() });
        socket.emit('error', { message: 'conversationId, itemId, and content are required' });
        return;
      }

      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          console.warn('[send_message] REJECTED — conversation not found:', conversationId);
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Verify sender is a conversation participant
        const userId = socket.data.userId;
        const isReporterSender = conversation.reporter.toString() === userId;
        const isFinderSender = conversation.finder.toString() === userId;

        console.log('[send_message] auth check', { reporter: conversation.reporter.toString(), finder: conversation.finder.toString(), userId, isReporterSender, isFinderSender });

        if (!isReporterSender && !isFinderSender) {
          console.warn('[send_message] REJECTED — not a participant');
          socket.emit('error', { message: 'Not authorized to send messages in this conversation' });
          return;
        }

        // Derive receiverId from conversation — never trust the client
        const receiverId = isReporterSender
          ? conversation.finder.toString()
          : conversation.reporter.toString();

        if (conversation.blockedBy && conversation.blockedBy.length > 0) {
          socket.emit('error', { message: 'This conversation has been blocked and you cannot send messages' });
          return;
        }

        // Handle canceled conversation
        if (conversation.status === 'canceled') {
          // If a finder messages again after it was canceled, reset it to pending
          conversation.status = 'pending';
          await conversation.save();
        }

        // Enforce 3 message limit for finders in pending state
        if (conversation.status === 'pending' && isFinderSender) {
          const messageCount = await Message.countDocuments({
            conversation: conversationId,
            sender: userId
          });

          if (messageCount >= 3) {
            socket.emit('error', { message: 'You can only send up to 3 messages before the reporter accepts your chat request.' });
            return;
          }
        }

        console.log('[send_message] creating message', { conversationId, itemId, sender: userId, receiver: receiverId });
        const newMessage = await Message.create({
          conversation: conversationId,
          item: itemId,
          sender: userId,
          receiver: receiverId,
          content: content.trim(),
        });
        console.log('[send_message] message saved to DB:', newMessage._id.toString());

        // Update conversation timestamp manually
        conversation.updatedAt = new Date();
        await conversation.save();

        const populated = await newMessage.populate([
          { path: 'sender', select: 'name _id' },
          { path: 'receiver', select: 'name _id' },
        ]);

        // Ensure sender is in the room — handles the race condition where send_message
        // arrives before the async join_room handler has called socket.join()
        if (!socket.rooms.has(conversationId)) {
          socket.join(conversationId);
        }

        // Emit to everyone in the room (including sender)
        io.to(conversationId).emit('receive_message', populated);

        // Emit notification to the receiver's personal room
        io.to(`user_${receiverId}`).emit('new_message_notification', {
          message: populated,
          conversationId,
          isMuted: conversation.mutedBy && conversation.mutedBy.some(id => id.toString() === receiverId)
        });
      } catch (err) {
        console.error(`[send_message] CAUGHT ERROR (room: ${conversationId}):`, err);
        socket.emit('error', { message: 'Failed to send message. Please try again.' });
      }
    });

    // ── typing ─────────────────────────────────────────────────────────────────
    socket.on('typing', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit('typing', { userId: socket.data.userId });
    });

    // ── stop_typing ────────────────────────────────────────────────────────────
    socket.on('stop_typing', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit('stop_typing', { userId: socket.data.userId });
    });

    // ── mark_read ──────────────────────────────────────────────────────────────
    socket.on('mark_read', async ({ messageId, conversationId }) => {
      if (!messageId || !conversationId) return;

      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        if (message.receiver.toString() !== socket.data.userId) return;

        message.isRead = true;
        await message.save();
        socket.to(conversationId).emit('message_read', { messageId });
      } catch (err) {
        console.error(`mark_read error (messageId: ${messageId}):`, err.message);
      }
    });

    // ── disconnect ─────────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};
