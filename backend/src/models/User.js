import crypto from 'node:crypto';
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator(value) {
          return value.endsWith('@iskolarngbayan.pup.edu.ph');
        },
        message: 'Email must be a valid PUP Iskolar ng Bayan address (@iskolarngbayan.pup.edu.ph)',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      // Stores the bcrypt hash — never the plaintext password
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpire: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Generates a password reset token, stores its SHA-256 hash on the document,
 * and returns the raw (unhashed) token to be sent in the email link.
 * Token expires in 10 minutes.
 */
userSchema.methods.getResetPasswordToken = function () {
  const rawToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  return rawToken;
};

/**
 * Generates a verification token, stores its SHA-256 hash on the document,
 * and returns the raw (unhashed) token to be sent in the email link.
 *
 * The raw token is never persisted — only the hash is stored in the DB.
 * This means a stolen DB dump cannot be used to verify an account directly.
 */
userSchema.methods.createEmailVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  // Token expires in 24 hours
  this.verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return rawToken;
};

const User = model('User', userSchema);

export default User;
