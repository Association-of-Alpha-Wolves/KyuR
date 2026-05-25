import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generates a signed JWT for the given user ID.
 */
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

  // Generate a verification token and email it to the user
  const rawToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'KyuR — Verify your email address',
      html: `
        <h2>Welcome to KyuR, ${user.name}!</h2>
        <p>Please verify your email address by clicking the link below.
           This link expires in <strong>24 hours</strong>.</p>
        <p>
          <a href="${verifyUrl}" style="
            display:inline-block;padding:12px 24px;background:#1d4ed8;
            color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;
          ">Verify Email</a>
        </p>
        <p>Or copy this URL into your browser:<br/><code>${verifyUrl}</code></p>
        <p>If you did not create an account, you can safely ignore this email.</p>
      `,
    });
  } catch {
    // Email delivery failed — clear the token so the user can request a new one
    user.verificationToken = null;
    user.verificationTokenExpire = null;
    await user.save({ validateBeforeSave: false });

    const error = new Error('Account created but verification email could not be sent. Please contact support.');
    error.statusCode = 500;
    throw error;
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
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

  // Explicitly select password since the schema doesn't exclude it by default
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    // Intentionally vague — don't reveal whether the email or password was wrong
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
 * @access  Private (requires protect middleware)
 */
export const getProfile = asyncHandler(async (req, res) => {
  // req.user is already populated and password-stripped by the protect middleware
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

/**
 * @route   GET /api/auth/verify/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  // Hash the raw URL token to match what is stored in the DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Verification link is invalid or has expired');
    error.statusCode = 400;
    throw error;
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpire = null;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now log in.',
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

  if (!user) {
    const error = new Error('No account found with that email address');
    error.statusCode = 404;
    throw error;
  }

  const rawToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${rawToken}`;

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
    // Email delivery failed — clear the token so the user can request a new one
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save({ validateBeforeSave: false });

    const error = new Error('Password reset email could not be sent. Please try again later.');
    error.statusCode = 500;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: 'Password reset email sent. Please check your inbox.',
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

  // Hash the raw URL token to match what is stored in the DB
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

  // Hash the new password manually — no pre-save hook exists on this model
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
