import User from '../models/User.js';
import Item from '../models/Item.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getMetrics = asyncHandler(async (req, res) => {
  // User metrics
  const totalUsers = await User.countDocuments();
  const students = await User.countDocuments({ role: 'student' });
  const faculty = await User.countDocuments({ role: 'faculty' });
  const admins = await User.countDocuments({ role: 'admin' });

  // Item metrics
  const totalItems = await Item.countDocuments();
  const lostItems = await Item.countDocuments({ status: 'lost' });
  const foundItems = await Item.countDocuments({ status: 'found' });
  const claimedItems = await Item.countDocuments({ status: 'claimed' });
  
  // Category metrics
  const categoryCounts = await Item.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  const categories = categoryCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  // Items added in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const itemsLast30Days = await Item.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  // Chat metrics
  const totalConversations = await Conversation.countDocuments();
  const totalMessages = await Message.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        students,
        faculty,
        admins
      },
      items: {
        total: totalItems,
        lost: lostItems,
        found: foundItems,
        claimed: claimedItems,
        last30Days: itemsLast30Days,
        categories
      },
      chat: {
        conversations: totalConversations,
        messages: totalMessages
      }
    }
  });
});
