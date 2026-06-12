import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const conversationSchema = new Schema(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item reference is required'],
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    finder: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Finder is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'canceled'],
      default: 'pending',
    },
    mutedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    archivedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    blockedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Ensure only one conversation exists per item and finder pair
conversationSchema.index({ item: 1, finder: 1 }, { unique: true });

const Conversation = model('Conversation', conversationSchema);

export default Conversation;
