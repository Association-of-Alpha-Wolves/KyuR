import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const error = new Error('Please provide name, email, and password');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('An account with that email already exists');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error('Please provide email and password');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    },
  });
});

/**
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

/**
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (name) {
    user.name = name.trim();
  }

  if (newPassword) {
    if (!currentPassword) {
      const error = new Error('Please provide your current password to set a new one');
      error.statusCode = 400;
      throw error;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 401;
      throw error;
    }
    if (newPassword.length < 6) {
      const error = new Error('New password must be at least 6 characters');
      error.statusCode = 400;
      throw error;
    }
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

/**
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    const error = new Error('Please provide your email address');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  const rawToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'KyuR — Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset for your KyuR account.</p>
        <p>Click the button below to set a new password.
           This link expires in <strong>10 minutes</strong>.</p>
        <p>
          <a href="${resetUrl}" style="
            display:inline-block;padding:12px 24px;background:#dc2626;
            color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;
          ">Reset Password</a>
        </p>
        <p>Or copy this URL into your browser:<br/><code>${resetUrl}</code></p>
        <p>If you did not request a password reset, you can safely ignore this email.
           Your password will not change.</p>
      `,
    });
  } catch {
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save({ validateBeforeSave: false });

    const error = new Error('Password reset email could not be sent. Please try again later.');
    error.statusCode = 500;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

/**
 * @route   PUT /api/auth/resetpassword/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Password reset link is invalid or has expired');
    error.statusCode = 400;
    throw error;
  }

  user.password = await bcrypt.hash(password, SALT_ROUNDS);
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Password reset successful.',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    },
  });
});
