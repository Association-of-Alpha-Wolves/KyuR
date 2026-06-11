import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const itemSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: ['electronics', 'wallet', 'id', 'accessories', 'other'],
      required: [true, 'Category is required'],
    },
    status: {
      type: String,
      enum: ['lost', 'found', 'claimed'],
      required: [true, 'Status is required'],
    },
    locationId: {
      type: String,
      required: [true, 'Location ID is required'],
      // Maps to a physical QR code installed at a campus location
    },
    imageUrl: {
      type: String,
      default: null,
      // Stores an AWS S3 object URL — image processing is offloaded to Lambda
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to support efficient filtering by category + status
itemSchema.index({ category: 1, status: 1 });

// Text index to support full-text keyword search across title and description
itemSchema.index({ title: 'text', description: 'text' });

const Item = model('Item', itemSchema);

export default Item;
