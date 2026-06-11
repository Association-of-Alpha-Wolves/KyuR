import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '../config/s3.js';
import Item from '../models/Item.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Uploads a file buffer to S3 and returns the public object URL.
 * Filename is a random 32-byte hex string to prevent collisions and
 * avoid leaking the original filename in the URL.
 */
const uploadToS3 = async (file) => {
  const extension = file.mimetype.split('/')[1].replace('jpeg', 'jpg');
  const fileName = `items/${crypto.randomBytes(32).toString('hex')}.${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

/**
 * @route   POST /api/items/createItem
 * @access  Private
 */
export const createItem = asyncHandler(async (req, res) => {
  const { title, description, category, status, locationId } = req.body;

  if (!title || !description || !category || !status || !locationId) {
    const error = new Error('Please provide title, description, category, status, and locationId');
    error.statusCode = 400;
    throw error;
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = await uploadToS3(req.file);
  }

  const item = await Item.create({
    title,
    description,
    category,
    status,
    locationId,
    imageUrl,
    reportedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: item,
  });
});

/**
 * @route   GET /api/items/getItems
 * @access  Private
 * @query   status, category, locationId — exact-match filters
 * @query   search — full-text keyword search across title and description
 * @query   page (default 1), limit (default 10) — pagination
 */
export const getItems = asyncHandler(async (req, res) => {
  const { status, category, locationId, search, reportedBy } = req.query;

  // Pagination params — coerce to integers and guard against bad input
  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
  const skip  = (page - 1) * limit;

  // Build query dynamically — only include filters that were actually provided
  const query = {};
  if (status)     query.status     = status;
  if (category)   query.category   = category;
  if (locationId) query.locationId = locationId;
  if (reportedBy && mongoose.Types.ObjectId.isValid(reportedBy)) {
    query.reportedBy = reportedBy;
  }

  // Full-text search uses the { title: 'text', description: 'text' } index.
  // Cannot be combined with a regex filter on the same fields — keep them separate.
  if (search) query.$text = { $search: search };

  // Run count and fetch in parallel — both use the same query object
  const [total, items] = await Promise.all([
    Item.countDocuments(query),
    Item.find(query)
      .populate('reportedBy', 'name email')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items,
      page,
      pages: Math.ceil(total / limit),
      total,
    },
  });
});

/**
 * @route   GET /api/items/:id
 * @access  Private
 */
export const getItemById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new Error('Invalid item ID');
    error.statusCode = 400;
    throw error;
  }

  const item = await Item.findById(req.params.id)
    .populate('reportedBy', 'name email')
    .populate('claimedBy', 'name email');

  if (!item) {
    const error = new Error('Item not found');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: item,
  });
});

/**
 * @route   PUT /api/items/:id/status
 * @access  Private
 */
export const updateItemStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const allowedStatuses = ['lost', 'found', 'claimed'];
  if (!status || !allowedStatuses.includes(status)) {
    const error = new Error(`Status must be one of: ${allowedStatuses.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new Error('Invalid item ID');
    error.statusCode = 400;
    throw error;
  }

  const item = await Item.findById(req.params.id);

  if (!item) {
    const error = new Error('Item not found');
    error.statusCode = 404;
    throw error;
  }

  if (item.reportedBy.toString() !== req.user._id.toString()) {
    const error = new Error('Not authorized to update this item');
    error.statusCode = 403;
    throw error;
  }

  item.status = status;

  if (status === 'claimed') {
    item.claimedBy = req.user._id;
  } else {
    item.claimedBy = null;
  }

  const updatedItem = await item.save();

  res.status(200).json({
    success: true,
    data: updatedItem,
  });
});

/**
 * @route   DELETE /api/items/:id
 * @access  Private
 */
export const deleteItem = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new Error('Invalid item ID');
    error.statusCode = 400;
    throw error;
  }

  const item = await Item.findById(req.params.id);

  if (!item) {
    const error = new Error('Item not found');
    error.statusCode = 404;
    throw error;
  }

  if (item.reportedBy.toString() !== req.user._id.toString()) {
    const error = new Error('Not authorized to delete this item');
    error.statusCode = 403;
    throw error;
  }

  await item.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Item deleted successfully',
  });
});
