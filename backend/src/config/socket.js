import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import Message from '../models/Message.js';

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
  // Clients must pass their JWT in socket.handshake.auth.token.
  // On success, the decoded user ID is attached to socket.data.userId.
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

    // ── join_room ──────────────────────────────────────────────────────────────
    // Client emits: { itemId: string }
    // The item's _id is used as the room name, scoping all messages to that item.
    socket.on('join_room', ({ itemId }) => {
      if (!itemId) return;
      socket.join(itemId);
      console.log(`Socket ${socket.id} joined room: ${itemId}`);
    });

    // ── send_message ───────────────────────────────────────────────────────────
    // Client emits: { itemId: string, receiverId: string, content: string }
    // Flow: validate → persist to MongoDB → broadcast to room.
    socket.on('send_message', async ({ itemId, receiverId, content }) => {
      if (!itemId || !receiverId || !content?.trim()) {
        socket.emit('error', { message: 'itemId, receiverId, and content are required' });
        return;
      }

      try {
        const newMessage = await Message.create({
          item: itemId,
          sender: socket.data.userId,
          receiver: receiverId,
          content: content.trim(),
        });

        // Populate sender/receiver names before broadcasting so clients
        // receive a fully-formed message object without a follow-up query.
        const populated = await newMessage.populate([
          { path: 'sender', select: 'name _id' },
          { path: 'receiver', select: 'name _id' },
        ]);

        // Emit only to sockets in this item's room (finder ↔ owner thread)
        io.to(itemId).emit('receive_message', populated);
      } catch (err) {
        console.error(`send_message error (room: ${itemId}):`, err.message);
        socket.emit('error', { message: 'Failed to send message. Please try again.' });
      }
    });

    // ── typing ─────────────────────────────────────────────────────────────────
    // Client emits: { itemId: string }
    // Broadcasts to everyone in the room except the sender so their own UI
    // doesn't show a "typing" indicator for themselves.
    socket.on('typing', ({ itemId }) => {
      if (!itemId) return;
      socket.to(itemId).emit('typing', { userId: socket.data.userId });
    });

    // ── stop_typing ────────────────────────────────────────────────────────────
    // Client emits: { itemId: string }
    socket.on('stop_typing', ({ itemId }) => {
      if (!itemId) return;
      socket.to(itemId).emit('stop_typing', { userId: socket.data.userId });
    });

    // ── mark_read ──────────────────────────────────────────────────────────────
    // Client emits: { messageId: string, itemId: string }
    // Persists the read state to MongoDB, then notifies the room so the
    // sender's UI can instantly show a "Read" checkmark without polling.
    socket.on('mark_read', async ({ messageId, itemId }) => {
      if (!messageId || !itemId) return;

      try {
        await Message.findByIdAndUpdate(messageId, { isRead: true });
        socket.to(itemId).emit('message_read', { messageId });
      } catch (err) {
        console.error(`mark_read error (messageId: ${messageId}):`, err.message);
        // No client-facing error emitted — a failed read receipt is non-critical
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
