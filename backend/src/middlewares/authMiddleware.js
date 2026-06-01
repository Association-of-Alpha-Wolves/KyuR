import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * protect
 * Verifies the Bearer JWT in the Authorization header.
 * On success, attaches the authenticated user (without password) to req.user.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    const error = new Error('Not authorized — no token provided');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    const error = new Error('Not authorized — token is invalid or expired');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    const error = new Error('Not authorized — user no longer exists');
    error.statusCode = 401;
    throw error;
  }

  req.user = user;
  next();
});
